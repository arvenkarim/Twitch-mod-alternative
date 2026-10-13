import { describe, expect, it } from "vitest";
import { normalizeSettingsPatch, timeoutSecondsError } from "./settings-input";
import type { ChannelSettings } from "./types";

const current: ChannelSettings = {
  operatingMode: "shadow",
  moderationLevel: "balanced",
  emergencyStop: false,
  maxTimeoutSeconds: 600,
  allowMessageDeletion: true,
  allowTimeouts: true,
  allowAutomaticBans: true,
  allowChatModeChanges: true,
  allowTitleProposals: true,
  houseRules: "Ban hate.",
  allowedTerms: ["pog"],
  blockedTerms: ["free viewers"],
  protectedRoles: ["broadcaster", "moderator"],
};

describe("channel settings input", () => {
  it("trims house rules and normalizes word lists", () => {
    const result = normalizeSettingsPatch(
      {
        houseRules: "  Keep it kind.  ",
        allowedTerms: [" Pog ", "pog", ""],
        blockedTerms: ["Free Viewers", "free viewers"],
      },
      current,
    );

    expect(result).toEqual({
      ok: true,
      value: {
        houseRules: "Keep it kind.",
        allowedTerms: ["pog"],
        blockedTerms: ["free viewers"],
      },
    });
  });

  it("rejects a term that is both allowed and blocked", () => {
    const result = normalizeSettingsPatch({ allowedTerms: ["free viewers"] }, current);

    expect(result).toEqual({
      ok: false,
      error: "A term cannot be both allowed and blocked: free viewers.",
    });
  });

  it("leaves an existing overlap alone when the patch does not edit word lists", () => {
    const overlapped: ChannelSettings = {
      ...current,
      allowedTerms: ["pog"],
      blockedTerms: ["pog"],
    };
    const result = normalizeSettingsPatch({ operatingMode: "live" }, overlapped);

    expect(result).toEqual({ ok: true, value: { operatingMode: "live" } });
  });

  it("keeps the broadcaster and moderators protected", () => {
    const result = normalizeSettingsPatch({ protectedRoles: ["viewer", "vip", "viewer"] }, current);

    expect(result).toEqual({
      ok: true,
      value: { protectedRoles: ["broadcaster", "moderator", "viewer", "vip"] },
    });
  });

  it("rejects terms that are too long or too many", () => {
    expect(normalizeSettingsPatch({ blockedTerms: ["x".repeat(41)] }, current)).toEqual({
      ok: false,
      error: "Terms must be 40 characters or fewer.",
    });
    expect(normalizeSettingsPatch({ allowedTerms: Array.from({ length: 41 }, (_, index) => `term${index}`) }, current)).toEqual({
      ok: false,
      error: "Use at most 40 terms in each list.",
    });
  });

  it("rejects a timeout outside the Twitch window", () => {
    expect(timeoutSecondsError(29)).toMatch(/30/);
    expect(normalizeSettingsPatch({ maxTimeoutSeconds: 1_209_601 }, current).ok).toBe(false);
    expect(normalizeSettingsPatch({ maxTimeoutSeconds: 600 }, current)).toEqual({
      ok: true,
      value: { maxTimeoutSeconds: 600 },
    });
  });
});
