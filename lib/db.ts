import { AsyncLocalStorage } from "node:async_hooks";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type {
  AuditRecord,
  ChannelSettings,
  ChatMessage,
  StreamMetadata,
  TitleProposal,
  TwitchConnection,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const databaseContext = new AsyncLocalStorage<Database.Database>();

export const DEFAULT_SETTINGS: ChannelSettings = {
  operatingMode: "shadow",
  moderationLevel: "balanced",
  emergencyStop: false,
  maxTimeoutSeconds: 600,
  allowMessageDeletion: true,
  allowTimeouts: true,
  allowAutomaticBans: true,
  allowChatModeChanges: true,
  allowTitleProposals: true,
  houseRules:
    "German community chat. Ban hate and harassment. Timeout raids. Delete spam. Keep light trash talk unless it targets a person.",
  allowedTerms: ["pog", "lulw", "ratio"],
  blockedTerms: ["onlyfans leak", "free viewers"],
  protectedRoles: ["moderator", "broadcaster"],
};

export const DEFAULT_STREAM: StreamMetadata = {
  title: "Late night Just Chatting",
  category: "Just Chatting",
  tags: ["german", "chill"],
};

let appDatabase: Database.Database | null = null;

export function resolveDatabasePath(): string {
  return process.env.NACHTSCHICHT_DB_PATH ?? path.join(DATA_DIR, "nachtschicht.sqlite");
}

export function openDatabase(filePath: string): Database.Database {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const database = new Database(filePath);
  database.pragma("journal_mode = WAL");
  initializeSchema(database);
  seedIfEmpty(database);
  return database;
}

export function runWithDatabase<T>(database: Database.Database, fn: () => T): T {
  return databaseContext.run(database, fn);
}

export function closeDatabase(database: Database.Database): void {
  if (appDatabase === database) {
    appDatabase = null;
  }
  database.close();
}

function getAppDatabase() {
  if (!appDatabase) {
    appDatabase = openDatabase(resolveDatabasePath());
  }
  return appDatabase;
}

function getDb() {
  return databaseContext.getStore() ?? getAppDatabase();
}

function initializeSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      operating_mode TEXT NOT NULL,
      max_timeout_seconds INTEGER NOT NULL,
      allow_automatic_bans INTEGER NOT NULL,
      house_rules TEXT NOT NULL,
      allowed_terms TEXT NOT NULL,
      blocked_terms TEXT NOT NULL,
      protected_roles TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stream_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS title_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      language TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      message_id TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      risk TEXT NOT NULL,
      confidence REAL NOT NULL,
      action TEXT NOT NULL,
      timeout_seconds INTEGER,
      executed INTEGER NOT NULL,
      reason TEXT NOT NULL,
      model_version TEXT NOT NULL,
      rule_version TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS twitch_account (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      broadcaster_id TEXT NOT NULL,
      login TEXT NOT NULL,
      display_name TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      scopes TEXT NOT NULL,
      eventsub_status TEXT
    );

    CREATE TABLE IF NOT EXISTS eventsub_events (
      message_id TEXT PRIMARY KEY,
      received_at TEXT NOT NULL
    );
  `);

  ensureColumn(database, "settings", "emergency_stop", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "settings", "moderation_level", "TEXT NOT NULL DEFAULT 'balanced'");
  ensureColumn(database, "settings", "allow_message_deletion", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn(database, "settings", "allow_timeouts", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn(database, "settings", "allow_chat_mode_changes", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn(database, "settings", "allow_title_proposals", "INTEGER NOT NULL DEFAULT 1");
}

function ensureColumn(database: Database.Database, table: string, column: string, definition: string) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((entry) => entry.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function seedIfEmpty(database: Database.Database) {
  const settingsCount = database.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingsCount.count === 0) {
    writeSettings(database, DEFAULT_SETTINGS);
  }

  const streamCount = database.prepare("SELECT COUNT(*) as count FROM stream_state").get() as { count: number };
  if (streamCount.count === 0) {
    writeStream(database, DEFAULT_STREAM);
  }
}

function writeSettings(database: Database.Database, settings: ChannelSettings) {
  database
    .prepare(
      `INSERT INTO settings (
        id, operating_mode, moderation_level, emergency_stop, max_timeout_seconds,
        allow_message_deletion, allow_timeouts, allow_automatic_bans,
        allow_chat_mode_changes, allow_title_proposals,
        house_rules, allowed_terms, blocked_terms, protected_roles
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        operating_mode = excluded.operating_mode,
        moderation_level = excluded.moderation_level,
        emergency_stop = excluded.emergency_stop,
        max_timeout_seconds = excluded.max_timeout_seconds,
        allow_message_deletion = excluded.allow_message_deletion,
        allow_timeouts = excluded.allow_timeouts,
        allow_automatic_bans = excluded.allow_automatic_bans,
        allow_chat_mode_changes = excluded.allow_chat_mode_changes,
        allow_title_proposals = excluded.allow_title_proposals,
        house_rules = excluded.house_rules,
        allowed_terms = excluded.allowed_terms,
        blocked_terms = excluded.blocked_terms,
        protected_roles = excluded.protected_roles`,
    )
    .run(
      settings.operatingMode,
      settings.moderationLevel,
      settings.emergencyStop ? 1 : 0,
      settings.maxTimeoutSeconds,
      settings.allowMessageDeletion ? 1 : 0,
      settings.allowTimeouts ? 1 : 0,
      settings.allowAutomaticBans ? 1 : 0,
      settings.allowChatModeChanges ? 1 : 0,
      settings.allowTitleProposals ? 1 : 0,
      settings.houseRules,
      JSON.stringify(settings.allowedTerms),
      JSON.stringify(settings.blockedTerms),
      JSON.stringify(settings.protectedRoles),
    );
}

function writeStream(database: Database.Database, stream: StreamMetadata) {
  database
    .prepare(
      `INSERT INTO stream_state (id, title, category, tags) VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, category = excluded.category, tags = excluded.tags`,
    )
    .run(stream.title, stream.category, JSON.stringify(stream.tags));
}

export function resetIsolatedModerationState(): void {
  const database = databaseContext.getStore();
  if (!database) {
    throw new Error("Isolated reset requires an explicit database context.");
  }

  const files = database.prepare("PRAGMA database_list").all() as Array<{ file: string }>;
  const file = files.find((entry) => entry.file)?.file ?? "";
  if (!file || path.resolve(file) === path.resolve(resolveDatabasePath())) {
    throw new Error("Refusing to reset the application database.");
  }

  const reset = database.transaction(() => {
    writeSettings(database, DEFAULT_SETTINGS);
    writeStream(database, DEFAULT_STREAM);
    database.exec(`
      DELETE FROM chat_messages;
      DELETE FROM audit_log;
      DELETE FROM title_proposals;
      DELETE FROM oauth_states;
      DELETE FROM eventsub_events;
      DELETE FROM twitch_account;
    `);
  });
  reset();
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function getSettings(): ChannelSettings {
  const row = getDb()
    .prepare(
      `SELECT operating_mode, emergency_stop, max_timeout_seconds, allow_automatic_bans, house_rules, allowed_terms, blocked_terms, protected_roles
              , moderation_level, allow_message_deletion, allow_timeouts, allow_chat_mode_changes, allow_title_proposals
       FROM settings WHERE id = 1`,
    )
    .get() as {
    operating_mode: ChannelSettings["operatingMode"];
    moderation_level: ChannelSettings["moderationLevel"];
    emergency_stop: number;
    max_timeout_seconds: number;
    allow_message_deletion: number;
    allow_timeouts: number;
    allow_automatic_bans: number;
    allow_chat_mode_changes: number;
    allow_title_proposals: number;
    house_rules: string;
    allowed_terms: string;
    blocked_terms: string;
    protected_roles: string;
  };

  return {
    operatingMode: row.operating_mode,
    moderationLevel: row.moderation_level,
    emergencyStop: Boolean(row.emergency_stop),
    maxTimeoutSeconds: row.max_timeout_seconds,
    allowMessageDeletion: Boolean(row.allow_message_deletion),
    allowTimeouts: Boolean(row.allow_timeouts),
    allowAutomaticBans: Boolean(row.allow_automatic_bans),
    allowChatModeChanges: Boolean(row.allow_chat_mode_changes),
    allowTitleProposals: Boolean(row.allow_title_proposals),
    houseRules: row.house_rules,
    allowedTerms: parseJson<string[]>(row.allowed_terms),
    blockedTerms: parseJson<string[]>(row.blocked_terms),
    protectedRoles: parseJson<ChannelSettings["protectedRoles"]>(row.protected_roles),
  };
}

export function updateSettings(settings: Partial<ChannelSettings>): ChannelSettings {
  const current = getSettings();
  const next = { ...current, ...settings };
  getDb()
    .prepare(
      `UPDATE settings SET
        operating_mode = ?,
        moderation_level = ?,
        emergency_stop = ?,
        max_timeout_seconds = ?,
        allow_message_deletion = ?,
        allow_timeouts = ?,
        allow_automatic_bans = ?,
        allow_chat_mode_changes = ?,
        allow_title_proposals = ?,
        house_rules = ?,
        allowed_terms = ?,
        blocked_terms = ?,
        protected_roles = ?
      WHERE id = 1`,
    )
    .run(
      next.operatingMode,
      next.moderationLevel,
      next.emergencyStop ? 1 : 0,
      next.maxTimeoutSeconds,
      next.allowMessageDeletion ? 1 : 0,
      next.allowTimeouts ? 1 : 0,
      next.allowAutomaticBans ? 1 : 0,
      next.allowChatModeChanges ? 1 : 0,
      next.allowTitleProposals ? 1 : 0,
      next.houseRules,
      JSON.stringify(next.allowedTerms),
      JSON.stringify(next.blockedTerms),
      JSON.stringify(next.protectedRoles),
    );
  return next;
}

export function getStreamMetadata(): StreamMetadata {
  const row = getDb()
    .prepare("SELECT title, category, tags FROM stream_state WHERE id = 1")
    .get() as { title: string; category: string; tags: string };

  return {
    title: row.title,
    category: row.category,
    tags: parseJson<string[]>(row.tags),
  };
}

export function updateStreamMetadata(stream: StreamMetadata): StreamMetadata {
  getDb()
    .prepare("UPDATE stream_state SET title = ?, category = ?, tags = ? WHERE id = 1")
    .run(stream.title, stream.category, JSON.stringify(stream.tags));
  return stream;
}

export function getPendingProposal(): TitleProposal | null {
  const row = getDb()
    .prepare(
      "SELECT title, category, tags, reason FROM title_proposals WHERE status = 'pending' ORDER BY id DESC LIMIT 1",
    )
    .get() as { title: string; category: string; tags: string; reason: string } | undefined;

  if (!row) {
    return null;
  }

  return {
    title: row.title,
    category: row.category,
    tags: parseJson<string[]>(row.tags),
    reason: row.reason,
  };
}

export function saveProposal(proposal: TitleProposal): TitleProposal {
  getDb().prepare("UPDATE title_proposals SET status = 'superseded' WHERE status = 'pending'").run();
  getDb()
    .prepare(
      "INSERT INTO title_proposals (title, category, tags, reason, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)",
    )
    .run(proposal.title, proposal.category, JSON.stringify(proposal.tags), proposal.reason, new Date().toISOString());
  return proposal;
}

export function resolvePendingProposal(status: "approved" | "rejected"): TitleProposal | null {
  const pending = getPendingProposal();
  if (!pending) {
    return null;
  }

  getDb().prepare("UPDATE title_proposals SET status = ? WHERE status = 'pending'").run(status);
  if (status === "approved") {
    updateStreamMetadata({
      title: pending.title,
      category: pending.category,
      tags: pending.tags,
    });
  }
  return pending;
}

export function saveMessage(message: ChatMessage): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO chat_messages (id, user_id, username, role, text, language, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      message.id,
      message.userId,
      message.username,
      message.role,
      message.text,
      message.language ?? null,
      message.createdAt,
    );
}

export function listRecentMessages(limit = 20): ChatMessage[] {
  const rows = getDb()
    .prepare(
      `SELECT id, user_id, username, role, text, language, created_at
       FROM chat_messages
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(limit) as Array<{
    id: string;
    user_id: string;
    username: string;
    role: ChatMessage["role"];
    text: string;
    language: string | null;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    text: row.text,
    language: row.language ?? undefined,
    createdAt: row.created_at,
  }));
}

export function saveAudit(record: AuditRecord): void {
  getDb()
    .prepare(
      `INSERT INTO audit_log (
        id, created_at, message_id, username, role, text, category, risk, confidence, action, timeout_seconds, executed, reason, model_version, rule_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.id,
      record.createdAt,
      record.messageId,
      record.username,
      record.role,
      record.text,
      record.category,
      record.risk,
      record.confidence,
      record.action,
      record.timeoutSeconds,
      record.executed ? 1 : 0,
      record.reason,
      record.modelVersion,
      record.ruleVersion,
    );
}

export function listAudit(limit = 25): AuditRecord[] {
  const rows = getDb()
    .prepare(
      `SELECT id, created_at, message_id, username, role, text, category, risk, confidence, action, timeout_seconds, executed, reason, model_version, rule_version
       FROM audit_log
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(limit) as Array<{
    id: string;
    created_at: string;
    message_id: string;
    username: string;
    role: AuditRecord["role"];
    text: string;
    category: AuditRecord["category"];
    risk: AuditRecord["risk"];
    confidence: number;
    action: AuditRecord["action"];
    timeout_seconds: number | null;
    executed: number;
    reason: string;
    model_version: string;
    rule_version: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    messageId: row.message_id,
    username: row.username,
    role: row.role,
    text: row.text,
    category: row.category,
    risk: row.risk,
    confidence: row.confidence,
    action: row.action,
    timeoutSeconds: row.timeout_seconds,
    executed: Boolean(row.executed),
    reason: row.reason,
    modelVersion: row.model_version,
    ruleVersion: row.rule_version,
  }));
}

export type StoredTwitchAccount = {
  broadcasterId: string;
  login: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scopes: string[];
  eventsubStatus: string | null;
};

export function saveOauthState(state: string): void {
  const database = getDb();
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  database.prepare("DELETE FROM oauth_states WHERE created_at < ?").run(cutoff);
  database.prepare("INSERT INTO oauth_states (state, created_at) VALUES (?, ?)").run(state, new Date().toISOString());
}

export function consumeOauthState(state: string): boolean {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const row = getDb().prepare("SELECT state FROM oauth_states WHERE state = ? AND created_at >= ?").get(state, cutoff);
  getDb().prepare("DELETE FROM oauth_states WHERE state = ?").run(state);
  return Boolean(row);
}

export function saveTwitchAccount(account: StoredTwitchAccount): void {
  getDb()
    .prepare(
      `INSERT INTO twitch_account (
        id, broadcaster_id, login, display_name, access_token, refresh_token, expires_at, scopes, eventsub_status
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        broadcaster_id = excluded.broadcaster_id,
        login = excluded.login,
        display_name = excluded.display_name,
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expires_at = excluded.expires_at,
        scopes = excluded.scopes,
        eventsub_status = excluded.eventsub_status`,
    )
    .run(
      account.broadcasterId,
      account.login,
      account.displayName,
      account.accessToken,
      account.refreshToken,
      account.expiresAt,
      JSON.stringify(account.scopes),
      account.eventsubStatus,
    );
}

export function getTwitchAccount(): StoredTwitchAccount | null {
  const row = getDb()
    .prepare(
      `SELECT broadcaster_id, login, display_name, access_token, refresh_token, expires_at, scopes, eventsub_status
       FROM twitch_account WHERE id = 1`,
    )
    .get() as
    | {
        broadcaster_id: string;
        login: string;
        display_name: string;
        access_token: string;
        refresh_token: string;
        expires_at: string;
        scopes: string;
        eventsub_status: string | null;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    broadcasterId: row.broadcaster_id,
    login: row.login,
    displayName: row.display_name,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiresAt: row.expires_at,
    scopes: parseJson<string[]>(row.scopes),
    eventsubStatus: row.eventsub_status,
  };
}

export function updateTwitchTokens(accessToken: string, refreshToken: string, expiresAt: string): void {
  getDb()
    .prepare("UPDATE twitch_account SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = 1")
    .run(accessToken, refreshToken, expiresAt);
}

export function updateEventsubStatus(status: string): void {
  getDb().prepare("UPDATE twitch_account SET eventsub_status = ? WHERE id = 1").run(status);
}

export function getTwitchConnection(): TwitchConnection {
  const account = getTwitchAccount();
  if (!account) {
    return { connected: false, login: null, eventsubStatus: null };
  }

  return {
    connected: true,
    login: account.login,
    eventsubStatus: account.eventsubStatus,
  };
}

export function rememberEvent(messageId: string): boolean {
  const result = getDb()
    .prepare("INSERT OR IGNORE INTO eventsub_events (message_id, received_at) VALUES (?, ?)")
    .run(messageId, new Date().toISOString());
  return result.changes > 0;
}

export function countRecentPunishments(username: string, sinceIso: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as count FROM audit_log
       WHERE username = ? AND executed = 1 AND action IN ('timeout', 'ban') AND created_at >= ?`,
    )
    .get(username, sinceIso) as { count: number };
  return row.count;
}
