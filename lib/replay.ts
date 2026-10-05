import path from "node:path";
import Database from "better-sqlite3";
import { replayCorpus, type CorpusCase, type CorpusStatus } from "./corpus";
import {
  DEFAULT_STREAM,
  getPendingProposal,
  getSettings,
  getStreamMetadata,
  listAudit,
  openDatabase,
  resetIsolatedModerationState,
  resolveDatabasePath,
  runWithDatabase,
} from "./db";
import { ingestChatMessage } from "./moderation";
import type { ChannelMode, ChatAction, ViolationCategory } from "./types";

export type ReplayCaseResult = {
  id: string;
  group: CorpusCase["group"];
  status: CorpusStatus;
  username: string;
  role: CorpusCase["role"];
  text: string;
  action: ChatAction;
  category: ViolationCategory;
  executed: boolean;
  channelGuard: ChannelMode | null;
  expectedAction: ChatAction;
  expectedCategory: ViolationCategory;
  matches: boolean;
  note: string;
};

export type ReplayReport = {
  mode: "shadow";
  twitchContacted: boolean;
  streamUnchanged: boolean;
  proposalPending: boolean;
  total: number;
  lockedPassed: number;
  lockedFailed: number;
  watchMissed: number;
  watchMatched: number;
  cases: ReplayCaseResult[];
};

let replayDatabase: Database.Database | null = null;

export function getReplayDatabasePath(): string {
  return path.join(process.cwd(), "data", "replay.sqlite");
}

export function openReplayDatabase() {
  const filePath = getReplayDatabasePath();
  if (path.resolve(filePath) === path.resolve(resolveDatabasePath())) {
    throw new Error("Replay database path collides with the application database.");
  }

  if (!replayDatabase) {
    replayDatabase = openDatabase(filePath);
  }
  return replayDatabase;
}

export function runReplay(database: Database.Database): ReplayReport {
  return runWithDatabase(database, () => {
    resetIsolatedModerationState();

    const cases = replayCorpus.map((entry) => {
      const outcome = ingestChatMessage({
        id: entry.id,
        userId: entry.userId,
        username: entry.username,
        role: entry.role,
        text: entry.text,
        language: entry.language,
      });
      const matches =
        outcome.decision.action === entry.expect.action &&
        outcome.classification.category === entry.expect.category &&
        outcome.decision.executed === false;

      const result: ReplayCaseResult = {
        id: entry.id,
        group: entry.group,
        status: entry.status,
        username: entry.username,
        role: entry.role,
        text: entry.text,
        action: outcome.decision.action,
        category: outcome.classification.category,
        executed: outcome.decision.executed,
        channelGuard: outcome.decision.channelGuard,
        expectedAction: entry.expect.action,
        expectedCategory: entry.expect.category,
        matches,
        note: entry.note,
      };
      return result;
    });

    const settings = getSettings();
    const stream = getStreamMetadata();
    const audit = listAudit(replayCorpus.length);
    const twitchContacted = audit.some(
      (row) => row.reason.includes("Helix") || row.reason.includes("Demo live action") || row.executed,
    );
    const streamUnchanged =
      stream.title === DEFAULT_STREAM.title &&
      stream.category === DEFAULT_STREAM.category &&
      stream.tags.join(",") === DEFAULT_STREAM.tags.join(",");

    if (settings.operatingMode !== "shadow" || settings.emergencyStop) {
      throw new Error("Replay left shadow mode.");
    }

    return {
      mode: "shadow",
      twitchContacted,
      streamUnchanged,
      proposalPending: getPendingProposal() !== null,
      total: cases.length,
      lockedPassed: cases.filter((entry) => entry.status === "locked" && entry.matches).length,
      lockedFailed: cases.filter((entry) => entry.status === "locked" && !entry.matches).length,
      watchMissed: cases.filter((entry) => entry.status === "watch" && !entry.matches).length,
      watchMatched: cases.filter((entry) => entry.status === "watch" && entry.matches).length,
      cases,
    };
  });
}
