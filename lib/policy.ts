import type { ChannelSettings, ChatAction, Classification, PolicyDecision, ChatMessage } from "./types";

export const RULE_VERSION = "policy-v2";

const ACTION_BY_RISK: Record<Classification["risk"], ChatAction> = {
  none: "ignore",
  low: "flag",
  medium: "delete",
  high: "timeout",
  severe: "ban",
};

const BAN_CONFIDENCE = 0.85;
const TIMEOUT_CONFIDENCE = 0.7;

export function decidePolicy(
  message: ChatMessage,
  classification: Classification,
  settings: ChannelSettings,
  strikeCount = 0,
): PolicyDecision {
  const protectedTarget = settings.protectedRoles.includes(message.role);
  let action = ACTION_BY_RISK[classification.risk];
  let reason = classification.reason;

  if (action === "ban" && classification.confidence < BAN_CONFIDENCE) {
    action = "timeout";
    reason = `Confidence ${classification.confidence.toFixed(2)} is below the ban threshold. ${classification.reason}`;
  }

  if (action === "timeout" && classification.confidence < TIMEOUT_CONFIDENCE) {
    action = "delete";
    reason = `Confidence ${classification.confidence.toFixed(2)} is below the timeout threshold. ${classification.reason}`;
  }

  if (
    action === "timeout" &&
    classification.risk === "high" &&
    strikeCount >= 2 &&
    settings.allowAutomaticBans &&
    classification.confidence >= BAN_CONFIDENCE
  ) {
    action = "ban";
    reason = `Repeat offender with ${strikeCount} recent punishments. ${classification.reason}`;
  }

  if (action === "ignore") {
    return emptyDecision(action, reason, protectedTarget);
  }

  if (protectedTarget && action !== "flag") {
    return emptyDecision("flag", `Protected ${message.role} was only flagged: ${reason}`, true);
  }

  if (action === "ban" && !settings.allowAutomaticBans) {
    action = "timeout";
    reason = `Automatic bans are disabled, so the policy used a timeout instead. ${reason}`;
  }

  const timeoutSeconds =
    action === "timeout"
      ? Math.min(settings.maxTimeoutSeconds, Math.max(60, 60 * 2 ** Math.min(strikeCount, 4)))
      : null;
  const held = settings.emergencyStop || settings.operatingMode !== "live" || action === "flag";
  const channelGuard =
    !held && classification.category === "raid" && (action === "timeout" || action === "ban")
      ? "follower_only"
      : null;

  if (settings.emergencyStop && action !== "flag") {
    reason = `Emergency stop held ${action}. ${reason}`;
  }

  return {
    action,
    timeoutSeconds,
    executed: !held,
    reason,
    protectedTarget,
    channelGuard,
  };
}

function emptyDecision(action: ChatAction, reason: string, protectedTarget: boolean): PolicyDecision {
  return {
    action,
    timeoutSeconds: null,
    executed: false,
    reason,
    protectedTarget,
    channelGuard: null,
  };
}
