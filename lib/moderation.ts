import { classifyMessage, getModelVersion } from "./classifier";
import {
  getPendingProposal,
  getSettings,
  getStreamMetadata,
  listAudit,
  listRecentMessages,
  resolvePendingProposal,
  saveAudit,
  saveMessage,
  saveProposal,
  updateSettings,
} from "./db";
import { decidePolicy, RULE_VERSION } from "./policy";
import { proposeStreamUpdate } from "./title-advisor";
import { executeTwitchAction } from "./twitch";
import type { ChannelSettings, ChatMessage, DashboardSnapshot } from "./types";

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function ingestChatMessage(input: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }): {
  message: ChatMessage;
  decision: ReturnType<typeof decidePolicy>;
} {
  const message: ChatMessage = {
    id: input.id ?? createId("msg"),
    userId: input.userId,
    username: input.username,
    role: input.role,
    text: input.text,
    language: input.language,
    createdAt: new Date().toISOString(),
  };

  const settings = getSettings();
  const classification = classifyMessage(message, settings);
  const decision = decidePolicy(message, classification, settings);
  const twitchResult = executeTwitchAction(message, decision);

  saveMessage(message);
  saveAudit({
    id: createId("audit"),
    createdAt: message.createdAt,
    messageId: message.id,
    username: message.username,
    role: message.role,
    text: message.text,
    category: classification.category,
    risk: classification.risk,
    confidence: classification.confidence,
    action: decision.action,
    timeoutSeconds: decision.timeoutSeconds,
    executed: twitchResult.executed,
    reason: twitchResult.detail,
    modelVersion: getModelVersion(),
    ruleVersion: RULE_VERSION,
  });

  const proposal = proposeStreamUpdate(getStreamMetadata(), message.text);
  if (proposal) {
    saveProposal(proposal);
  }

  return { message, decision };
}

export function getDashboard(): DashboardSnapshot {
  return {
    settings: getSettings(),
    stream: getStreamMetadata(),
    pendingProposal: getPendingProposal(),
    recentMessages: listRecentMessages(),
    audit: listAudit(),
  };
}

export function setOperatingMode(operatingMode: ChannelSettings["operatingMode"]) {
  return updateSettings({ operatingMode });
}

export function decideTitleProposal(status: "approved" | "rejected") {
  return resolvePendingProposal(status);
}
