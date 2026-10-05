import { describe, expect, it } from "vitest";
import { classifyMessage } from "./classifier";
import { decidePolicy } from "./policy";
import { proposeStreamUpdate } from "./title-advisor";
import type { ChannelSettings, ChatMessage } from "./types";

const settings: ChannelSettings = {
  operatingMode: "live",
  maxTimeoutSeconds: 600,
  allowAutomaticBans: true,
  houseRules: "Ban hate. Timeout raids. Delete spam.",
  allowedTerms: ["pog"],
  blockedTerms: ["free viewers"],
  protectedRoles: ["moderator", "broadcaster"],
};

function message(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: "msg_1",
    userId: "u_1",
    username: "viewer",
    role: "viewer",
    text: "hello",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("moderation policy", () => {
  it("ignores allowed community slang", () => {
    const chat = message({ text: "Pog that play" });
    const classification = classifyMessage(chat, settings);
    const decision = decidePolicy(chat, classification, settings);

    expect(classification.category).toBe("none");
    expect(decision.action).toBe("ignore");
    expect(decision.executed).toBe(false);
  });

  it("deletes spam and blocked terms", () => {
    const chat = message({ text: "FREE VIEWERS http://spam.example" });
    const classification = classifyMessage(chat, settings);
    const decision = decidePolicy(chat, classification, settings);

    expect(classification.risk).toBe("medium");
    expect(decision.action).toBe("delete");
    expect(decision.executed).toBe(true);
  });

  it("bans severe hate from regular viewers", () => {
    const chat = message({ text: "hate raid incoming kill all of them" });
    const classification = classifyMessage(chat, settings);
    const decision = decidePolicy(chat, classification, settings);

    expect(classification.risk).toBe("severe");
    expect(decision.action).toBe("ban");
    expect(decision.executed).toBe(true);
  });

  it("only flags protected moderators", () => {
    const chat = message({
      username: "night_mod",
      role: "moderator",
      text: "kys is never okay",
    });
    const classification = classifyMessage(chat, settings);
    const decision = decidePolicy(chat, classification, settings);

    expect(decision.protectedTarget).toBe(true);
    expect(decision.action).toBe("flag");
    expect(decision.executed).toBe(false);
  });

  it("stays in shadow mode until the streamer goes live", () => {
    const chat = message({ text: "you suck at this game trash" });
    const classification = classifyMessage(chat, { ...settings, operatingMode: "shadow" });
    const decision = decidePolicy(chat, classification, { ...settings, operatingMode: "shadow" });

    expect(decision.action).toBe("flag");
    expect(decision.executed).toBe(false);
  });

  it("proposes a title change without publishing it", () => {
    const proposal = proposeStreamUpdate(
      { title: "Late night Just Chatting", category: "Just Chatting", tags: ["german"] },
      "switching to valorant ranked after this game",
    );

    expect(proposal).toEqual({
      title: "Ranked Valorant — clutch or throw",
      category: "VALORANT",
      tags: ["ranked", "fps", "chill"],
      reason: "Detected a topic shift toward VALORANT. Waiting for broadcaster approval before publishing.",
    });
  });
});
