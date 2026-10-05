export const channelRoles = ["viewer", "subscriber", "vip", "moderator", "broadcaster"] as const;
export type ChannelRole = (typeof channelRoles)[number];

export const riskLevels = ["none", "low", "medium", "high", "severe"] as const;
export type RiskLevel = (typeof riskLevels)[number];

export const violationCategories = [
  "none",
  "spam",
  "toxicity",
  "harassment",
  "hate",
  "sexual",
  "raid",
  "self_harm",
] as const;
export type ViolationCategory = (typeof violationCategories)[number];

export const chatActions = [
  "ignore",
  "flag",
  "warn",
  "delete",
  "timeout",
  "ban",
] as const;
export type ChatAction = (typeof chatActions)[number];

export const channelModes = ["slow", "emote_only", "follower_only", "subscriber_only"] as const;
export type ChannelMode = (typeof channelModes)[number];

export const operatingModes = ["shadow", "live"] as const;
export type OperatingMode = (typeof operatingModes)[number];

export type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  role: ChannelRole;
  text: string;
  language?: string;
  createdAt: string;
};

export type Classification = {
  category: ViolationCategory;
  risk: RiskLevel;
  confidence: number;
  reason: string;
  matchedTerms: string[];
};

export type PolicyDecision = {
  action: ChatAction;
  timeoutSeconds: number | null;
  executed: boolean;
  reason: string;
  protectedTarget: boolean;
  channelGuard: ChannelMode | null;
};

export type ChannelSettings = {
  operatingMode: OperatingMode;
  emergencyStop: boolean;
  maxTimeoutSeconds: number;
  allowAutomaticBans: boolean;
  houseRules: string;
  allowedTerms: string[];
  blockedTerms: string[];
  protectedRoles: ChannelRole[];
};

export type StreamMetadata = {
  title: string;
  category: string;
  tags: string[];
};

export type TitleProposal = {
  title: string;
  category: string;
  tags: string[];
  reason: string;
};

export type AuditRecord = {
  id: string;
  createdAt: string;
  messageId: string;
  username: string;
  role: ChannelRole;
  text: string;
  category: ViolationCategory;
  risk: RiskLevel;
  confidence: number;
  action: ChatAction;
  timeoutSeconds: number | null;
  executed: boolean;
  reason: string;
  modelVersion: string;
  ruleVersion: string;
};

export type TwitchConnection = {
  connected: boolean;
  login: string | null;
  eventsubStatus: string | null;
};

export type DashboardSnapshot = {
  settings: ChannelSettings;
  stream: StreamMetadata;
  pendingProposal: TitleProposal | null;
  recentMessages: ChatMessage[];
  audit: AuditRecord[];
  connection: TwitchConnection;
};
