import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { replayCorpus } from "./corpus";
import {
  closeDatabase,
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
import { getModelVersion } from "./classifier";
import { RULE_VERSION } from "./policy";
import { getReplayDatabasePath, runReplay, type ReplayReport } from "./replay";

const opened: Database.Database[] = [];
const directories: string[] = [];

function tempDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nachtschicht-replay-"));
  directories.push(directory);
  const database = openDatabase(path.join(directory, "replay.sqlite"));
  opened.push(database);
  return database;
}

afterEach(() => {
  while (opened.length > 0) {
    const database = opened.pop();
    if (database) {
      closeDatabase(database);
    }
  }
  while (directories.length > 0) {
    const directory = directories.pop();
    if (directory) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});

describe("replay environment", () => {
  it("keeps the replay file away from the application database", () => {
    expect(path.resolve(getReplayDatabasePath())).not.toBe(path.resolve(resolveDatabasePath()));
    expect(new Set(replayCorpus.map((entry) => entry.id)).size).toBe(replayCorpus.length);
  });

  it("refuses to reset the application database", () => {
    expect(() => resetIsolatedModerationState()).toThrow(/explicit database context/);
  });

  it("replays the corpus in shadow without touching the live database or Twitch", () => {
    const livePath = resolveDatabasePath();
    const before = fs.existsSync(livePath) ? fs.statSync(livePath).mtimeMs : null;
    const database = tempDatabase();

    const report = runWithDatabase(database, () => {
      const first = runReplay(database);
      runReplay(database);
      const audit = listAudit(replayCorpus.length + 5);

      expect(audit).toHaveLength(replayCorpus.length);
      expect(audit.every((row) => row.executed === false)).toBe(true);
      expect(audit.every((row) => row.reason.startsWith("Shadow decision"))).toBe(true);
      expect(audit.every((row) => row.modelVersion === getModelVersion())).toBe(true);
      expect(audit.every((row) => row.ruleVersion === RULE_VERSION)).toBe(true);
      expect(getSettings()).toMatchObject({ operatingMode: "shadow", emergencyStop: false });
      expect(getStreamMetadata()).toEqual(DEFAULT_STREAM);
      expect(getPendingProposal()).not.toBeNull();
      return first;
    });

    const after = fs.existsSync(livePath) ? fs.statSync(livePath).mtimeMs : null;
    expect(after).toBe(before);
    expectReplayContract(report);

    if (process.env.REPLAY_REPORT === "1") {
      for (const row of report.cases) {
        const mark = row.matches ? "ok" : row.status === "watch" ? "gap" : "fail";
        console.log(`${mark}\t${row.id}\t${row.category}/${row.action}\texpected ${row.expectedCategory}/${row.expectedAction}`);
      }
    }
  });
});

function expectReplayContract(report: ReplayReport) {
  expect(report.mode).toBe("shadow");
  expect(report.twitchContacted).toBe(false);
  expect(report.streamUnchanged).toBe(true);
  expect(report.proposalPending).toBe(true);
  expect(report.lockedFailed).toBe(0);
  expect(report.cases.every((entry) => entry.executed === false)).toBe(true);
  expect(report.cases.find((entry) => entry.id === "raid-follow")).toMatchObject({
    action: "timeout",
    channelGuard: null,
    matches: true,
  });
  expect(report.cases.find((entry) => entry.id === "protected-mod")).toMatchObject({
    action: "flag",
    executed: false,
    matches: true,
  });
  expect(report.cases.filter((entry) => !entry.matches).map((entry) => entry.id).sort()).toEqual([
    "german-insult",
    "quote-kys",
    "sarcasm-kill-all",
  ]);
}
