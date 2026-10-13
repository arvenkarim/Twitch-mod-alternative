import { channelRoles, type ChannelRole, type ChannelSettings } from "./types";

export const LOCKED_PROTECTED_ROLES: ChannelRole[] = ["broadcaster", "moderator"];

export const SETTINGS_LIMITS = {
  houseRules: 2_000,
  terms: 40,
  termLength: 40,
} as const;

export const TIMEOUT_SECONDS = {
  min: 30,
  max: 1_209_600,
} as const;

export type SettingsPatch = Partial<
  Pick<
    ChannelSettings,
    | "operatingMode"
    | "moderationLevel"
    | "emergencyStop"
    | "maxTimeoutSeconds"
    | "allowMessageDeletion"
    | "allowTimeouts"
    | "allowAutomaticBans"
    | "allowChatModeChanges"
    | "allowTitleProposals"
    | "houseRules"
    | "allowedTerms"
    | "blockedTerms"
    | "protectedRoles"
  >
>;

export type NormalizeResult = { ok: true; value: SettingsPatch } | { ok: false; error: string };

export function timeoutSecondsError(value: number): string | null {
  if (!Number.isInteger(value) || value < TIMEOUT_SECONDS.min || value > TIMEOUT_SECONDS.max) {
    return "Maximum timeout must be a whole number of seconds from 30 up to 14 days.";
  }
  return null;
}

export function normalizeSettingsPatch(patch: SettingsPatch, current: ChannelSettings): NormalizeResult {
  const value: SettingsPatch = { ...patch };

  if (patch.houseRules !== undefined) {
    const houseRules = patch.houseRules.trim();
    if (houseRules.length > SETTINGS_LIMITS.houseRules) {
      return { ok: false, error: "House rules are too long." };
    }
    value.houseRules = houseRules;
  }

  if (patch.maxTimeoutSeconds !== undefined) {
    const timeoutError = timeoutSecondsError(patch.maxTimeoutSeconds);
    if (timeoutError) {
      return { ok: false, error: timeoutError };
    }
  }

  const allowed = patch.allowedTerms !== undefined ? normalizeTermList(patch.allowedTerms) : null;
  const blocked = patch.blockedTerms !== undefined ? normalizeTermList(patch.blockedTerms) : null;
  if (allowed && !allowed.ok) {
    return allowed;
  }
  if (blocked && !blocked.ok) {
    return blocked;
  }

  if (patch.allowedTerms !== undefined || patch.blockedTerms !== undefined) {
    const nextAllowed = allowed && allowed.ok ? allowed.terms : current.allowedTerms;
    const nextBlocked = blocked && blocked.ok ? blocked.terms : current.blockedTerms;
    const overlap = nextAllowed.find((term) => nextBlocked.includes(term));
    if (overlap) {
      return { ok: false, error: `A term cannot be both allowed and blocked: ${overlap}.` };
    }
  }

  if (allowed && allowed.ok) {
    value.allowedTerms = allowed.terms;
  }
  if (blocked && blocked.ok) {
    value.blockedTerms = blocked.terms;
  }

  if (patch.protectedRoles !== undefined) {
    const extras = channelRoles.filter(
      (role) => patch.protectedRoles?.includes(role) && !LOCKED_PROTECTED_ROLES.includes(role),
    );
    value.protectedRoles = [...LOCKED_PROTECTED_ROLES, ...extras];
  }

  return { ok: true, value };
}

function normalizeTermList(terms: string[]): { ok: true; terms: string[] } | { ok: false; error: string } {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const raw of terms) {
    const term = raw.trim().toLowerCase();
    if (!term) {
      continue;
    }
    if (term.length > SETTINGS_LIMITS.termLength) {
      return { ok: false, error: `Terms must be ${SETTINGS_LIMITS.termLength} characters or fewer.` };
    }
    if (seen.has(term)) {
      continue;
    }
    seen.add(term);
    normalized.push(term);
  }
  if (normalized.length > SETTINGS_LIMITS.terms) {
    return { ok: false, error: `Use at most ${SETTINGS_LIMITS.terms} terms in each list.` };
  }
  return { ok: true, terms: normalized };
}
