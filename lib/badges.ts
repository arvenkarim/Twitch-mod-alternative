import type { ChannelRole } from "./types";

export function roleFromBadges(badges: Array<{ set_id?: string }> | undefined): ChannelRole {
  const ids = new Set((badges ?? []).map((badge) => badge.set_id));
  if (ids.has("broadcaster")) {
    return "broadcaster";
  }
  if (ids.has("moderator")) {
    return "moderator";
  }
  if (ids.has("vip")) {
    return "vip";
  }
  if (ids.has("subscriber")) {
    return "subscriber";
  }
  return "viewer";
}
