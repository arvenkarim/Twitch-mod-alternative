import type { ChatMessage, PolicyDecision } from "./types";

export type TwitchActionResult = {
  executed: boolean;
  provider: "demo" | "twitch";
  detail: string;
};

export function getTwitchConfig() {
  return {
    clientId: process.env.TWITCH_CLIENT_ID ?? "",
    clientSecret: process.env.TWITCH_CLIENT_SECRET ?? "",
    redirectUri: process.env.TWITCH_REDIRECT_URI ?? "http://localhost:3000/api/twitch/callback",
    botUserId: process.env.TWITCH_BOT_USER_ID ?? "",
    scopes: [
      "user:read:chat",
      "user:write:chat",
      "moderator:manage:chat_messages",
      "moderator:manage:banned_users",
      "moderator:manage:chat_settings",
      "channel:manage:broadcast",
    ],
  };
}

export function isTwitchConfigured(): boolean {
  const config = getTwitchConfig();
  return Boolean(config.clientId && config.clientSecret && config.botUserId);
}

export function executeTwitchAction(message: ChatMessage, decision: PolicyDecision): TwitchActionResult {
  if (!decision.executed) {
    return {
      executed: false,
      provider: "demo",
      detail: `Shadow decision ${decision.action} for ${message.username}: ${decision.reason}`,
    };
  }

  if (!isTwitchConfigured()) {
    return {
      executed: true,
      provider: "demo",
      detail: `Demo live action ${decision.action}${
        decision.timeoutSeconds ? ` (${decision.timeoutSeconds}s)` : ""
      } against ${message.username}. Connect Twitch to send this to the Helix API.`,
    };
  }

  return {
    executed: true,
    provider: "twitch",
    detail: `Would call Twitch Helix for ${decision.action} on ${message.username}.`,
  };
}

export function buildTwitchAuthorizeUrl(state: string): string {
  const config = getTwitchConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    force_verify: "true",
  });
  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}
