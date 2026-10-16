"use client";

import { useState } from "react";
import {
  LOCKED_PROTECTED_ROLES,
  SETTINGS_LIMITS,
  TIMEOUT_SECONDS,
  normalizeSettingsPatch,
  type SettingsPatch,
} from "@/lib/settings-input";
import type { ChannelRole, ChannelSettings, ModerationLevel } from "@/lib/types";
import { AnimatePresence, PopIn, Pressable, PulseDot, Switch } from "@/components/motion";

const levels: Array<{ id: ModerationLevel; title: string; summary: string }> = [
  {
    id: "relaxed",
    title: "Relaxed",
    summary: "Flag instead of punishing. Severe violations time out at most.",
  },
  {
    id: "balanced",
    title: "Balanced",
    summary: "Delete spam, time out harassment, and ban severe violations.",
  },
  {
    id: "strict",
    title: "Strict",
    summary: "Delete light violations, time out spam, and ban earlier.",
  },
];

const matrix: Record<ModerationLevel, Array<[string, string]>> = {
  relaxed: [
    ["None", "Ignore"],
    ["Low", "Ignore"],
    ["Medium", "Flag"],
    ["High", "Delete"],
    ["Severe", "Timeout"],
  ],
  balanced: [
    ["None", "Ignore"],
    ["Low", "Flag"],
    ["Medium", "Delete"],
    ["High", "Timeout"],
    ["Severe", "Ban"],
  ],
  strict: [
    ["None", "Ignore"],
    ["Low", "Delete"],
    ["Medium", "Timeout"],
    ["High", "Ban"],
    ["Severe", "Ban"],
  ],
};

const permissions: Array<{
  key: "allowMessageDeletion" | "allowTimeouts" | "allowAutomaticBans" | "allowChatModeChanges" | "allowTitleProposals";
  label: string;
  detail: string;
}> = [
  { key: "allowMessageDeletion", label: "Delete messages", detail: "Off: a delete becomes a flag." },
  { key: "allowTimeouts", label: "Timeout users", detail: "Off: a timeout becomes a delete." },
  {
    key: "allowAutomaticBans",
    label: "Ban on its own",
    detail: "Off: a ban becomes a timeout. Unban stays human-only.",
  },
  {
    key: "allowChatModeChanges",
    label: "Protect chat in a raid",
    detail: "Follower-only mode, only after a raid timeout or ban.",
  },
  {
    key: "allowTitleProposals",
    label: "Propose title, category, and tags",
    detail: "Publication still waits for you.",
  },
];

const roleOrder: ChannelRole[] = ["broadcaster", "moderator", "vip", "subscriber", "viewer"];

const roleLabel: Record<ChannelRole, string> = {
  broadcaster: "Broadcaster",
  moderator: "Moderators",
  vip: "VIPs",
  subscriber: "Subscribers",
  viewer: "Viewers",
};

function configPatch(settings: ChannelSettings): SettingsPatch {
  return {
    moderationLevel: settings.moderationLevel,
    maxTimeoutSeconds: settings.maxTimeoutSeconds,
    allowMessageDeletion: settings.allowMessageDeletion,
    allowTimeouts: settings.allowTimeouts,
    allowAutomaticBans: settings.allowAutomaticBans,
    allowChatModeChanges: settings.allowChatModeChanges,
    allowTitleProposals: settings.allowTitleProposals,
    houseRules: settings.houseRules,
    allowedTerms: settings.allowedTerms,
    blockedTerms: settings.blockedTerms,
    protectedRoles: settings.protectedRoles,
  };
}

function sameConfig(left: ChannelSettings, right: ChannelSettings) {
  return JSON.stringify(configPatch(left)) === JSON.stringify(configPatch(right));
}

export function SettingsForm({ initialSettings }: { initialSettings: ChannelSettings }) {
  const [saved, setSaved] = useState(initialSettings);
  const [draft, setDraft] = useState(initialSettings);
  const [allowedInput, setAllowedInput] = useState("");
  const [blockedInput, setBlockedInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Shadow mode is the safe start. Live mode carries out only what you allow here.");
  const [noticeTone, setNoticeTone] = useState<"ok" | "error">("ok");

  const normalized = normalizeSettingsPatch(configPatch(draft), saved);
  const dirty = !sameConfig(draft, saved);
  const formError = normalized.ok ? null : normalized.error;

  async function postSettings(patch: SettingsPatch, success: string) {
    setBusy(true);
    setNoticeTone("ok");
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = (await response.json()) as ChannelSettings | { error?: string };
      if (!response.ok || !("operatingMode" in body)) {
        throw new Error("error" in body && body.error ? body.error : "Could not save channel settings.");
      }
      const keepDraftConfig = patch.moderationLevel === undefined;
      setSaved(body);
      setDraft((current) =>
        keepDraftConfig
          ? { ...current, operatingMode: body.operatingMode, emergencyStop: body.emergencyStop }
          : body,
      );
      setNotice(success);
      setNoticeTone("ok");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save channel settings.");
      setNoticeTone("error");
    } finally {
      setBusy(false);
    }
  }

  function addTerms(field: "allowedTerms" | "blockedTerms", raw: string) {
    const pieces = raw
      .split(/[\n,]/)
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    if (pieces.length === 0) {
      return;
    }
    setDraft((current) => {
      const next = [...current[field]];
      for (const term of pieces) {
        if (!next.includes(term)) {
          next.push(term);
        }
      }
      return { ...current, [field]: next };
    });
    if (field === "allowedTerms") {
      setAllowedInput("");
    } else {
      setBlockedInput("");
    }
  }

  const previewRoles = roleOrder.filter(
    (role) => LOCKED_PROTECTED_ROLES.includes(role) || draft.protectedRoles.includes(role),
  );

  return (
    <form
      className="settings-layout"
      onSubmit={(event) => {
        event.preventDefault();
        if (!normalized.ok || !dirty) {
          return;
        }
        void postSettings(normalized.value, "Channel settings saved.");
      }}
    >
      <div className="stack">
        <header className="page-head">
          <div>
            <p className="kicker">Channel settings</p>
            <h1>Rules for this channel</h1>
            <p className="lede">
              The same brief you would give a human moderator, with a written reason for every decision. Stay in
              shadow until the audit looks right, then switch to live.
            </p>
          </div>
        </header>

        <section className="panel">
          <h2>Safety</h2>
          <p className="muted">These switch immediately. The rest of this page saves together.</p>
          <div className="choice-grid two">
            <Pressable
              type="button"
              className={`choice-card ${saved.operatingMode === "shadow" ? "selected" : ""}`}
              disabled={busy}
              onClick={() => {
                if (saved.operatingMode === "shadow") {
                  return;
                }
                void postSettings(
                  { operatingMode: "shadow" },
                  "Shadow mode is on. Decisions stay in the audit.",
                );
              }}
            >
              <strong>Shadow</strong>
              <span>Score chat and keep the audit. Nothing is deleted, timed out, or banned.</span>
            </Pressable>
            <Pressable
              type="button"
              className={`choice-card ${saved.operatingMode === "live" ? "selected" : ""}`}
              disabled={busy}
              onClick={() => {
                if (saved.operatingMode === "live") {
                  return;
                }
                void postSettings(
                  { operatingMode: "live" },
                  "Live mode is on. Allowed actions can reach chat.",
                );
              }}
            >
              <strong>Live</strong>
              <span>Carry out deletes, timeouts, bans, and raid protection when they are allowed below.</span>
            </Pressable>
          </div>
          <div className={`emergency-card ${saved.emergencyStop ? "active" : ""}`}>
            <div>
              <strong className="status-title">
                <PulseDot tone={saved.emergencyStop ? "danger" : "ok"} active={saved.emergencyStop} />
                Emergency stop
              </strong>
              <div className="muted">
                {saved.emergencyStop
                  ? "On: every action is held and only logged."
                  : "Off: permitted actions may execute in live mode."}
              </div>
            </div>
            <Pressable
              type="button"
              className={saved.emergencyStop ? "secondary" : "danger"}
              disabled={busy}
              onClick={() =>
                void postSettings(
                  { emergencyStop: !saved.emergencyStop },
                  saved.emergencyStop ? "Emergency stop released." : "Emergency stop is holding every action.",
                )
              }
            >
              {saved.emergencyStop ? "Release stop" : "Activate stop"}
            </Pressable>
          </div>
        </section>

        <section className="panel">
          <h2>How strict</h2>
          <p className="muted">The level picks the action. Permissions below can only make it softer.</p>
          <div className="choice-grid">
            {levels.map((level) => (
              <Pressable
                key={level.id}
                type="button"
                className={`choice-card ${draft.moderationLevel === level.id ? "selected" : ""}`}
                disabled={busy}
                onClick={() => setDraft((current) => ({ ...current, moderationLevel: level.id }))}
              >
                <strong>{level.title}</strong>
                <span>{level.summary}</span>
              </Pressable>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>What Nachtschicht may do</h2>
          <div className="permission-list">
            {permissions.map((permission) => (
              <label className="permission-toggle" key={permission.key}>
                <Switch
                  checked={draft[permission.key]}
                  disabled={busy}
                  onChange={(checked) => setDraft((current) => ({ ...current, [permission.key]: checked }))}
                />
                <span className="permission-copy">
                  <strong>{permission.label}</strong>
                  <span className="muted">{permission.detail}</span>
                </span>
              </label>
            ))}
          </div>
          <label>
            Maximum timeout in seconds
            <input
              type="number"
              min={TIMEOUT_SECONDS.min}
              max={TIMEOUT_SECONDS.max}
              value={draft.maxTimeoutSeconds}
              disabled={busy}
              onChange={(event) => {
                const value = Number(event.target.value);
                setDraft((current) => ({
                  ...current,
                  maxTimeoutSeconds: Number.isFinite(value) ? value : current.maxTimeoutSeconds,
                }));
              }}
            />
          </label>
          <p className="muted">Starts at 60 seconds and doubles on repeat, capped by this limit.</p>
        </section>

        <section className="panel">
          <h2>Channel rules</h2>
          <label>
            House rules
            <textarea
              rows={5}
              maxLength={SETTINGS_LIMITS.houseRules}
              value={draft.houseRules}
              disabled={busy}
              onChange={(event) => setDraft((current) => ({ ...current, houseRules: event.target.value }))}
            />
          </label>
          <p className="muted">
            {draft.houseRules.trim().length} / {SETTINGS_LIMITS.houseRules}. Word lists are enforced now. This
            brief is saved with the channel for the language model.
          </p>
          <TermEditor
            label="Allowed community terms"
            hint="Slang that should stay in chat, unless the message is already hate, harassment, sexual, or a raid."
            fieldId="allowed-terms"
            terms={draft.allowedTerms}
            value={allowedInput}
            disabled={busy}
            onValueChange={setAllowedInput}
            onAdd={() => addTerms("allowedTerms", allowedInput)}
            onRemove={(term) =>
              setDraft((current) => ({
                ...current,
                allowedTerms: current.allowedTerms.filter((entry) => entry !== term),
              }))
            }
          />
          <TermEditor
            label="Blocked terms"
            hint="Channel-specific spam or scam phrases. A match is treated as medium-risk spam."
            fieldId="blocked-terms"
            terms={draft.blockedTerms}
            value={blockedInput}
            disabled={busy}
            onValueChange={setBlockedInput}
            onAdd={() => addTerms("blockedTerms", blockedInput)}
            onRemove={(term) =>
              setDraft((current) => ({
                ...current,
                blockedTerms: current.blockedTerms.filter((entry) => entry !== term),
              }))
            }
          />
        </section>

        <section className="panel">
          <h2>Who stays protected</h2>
          <p className="muted">
            Protected people are flagged, never punished. The broadcaster and moderators cannot be turned off.
          </p>
          <div className="permission-list">
            {roleOrder.map((role) => {
              const locked = LOCKED_PROTECTED_ROLES.includes(role);
              const checked = locked || draft.protectedRoles.includes(role);
              return (
                <label className="permission-toggle" key={role}>
                  <Switch
                    checked={checked}
                    disabled={busy || locked}
                    onChange={(next) => {
                      if (locked) {
                        return;
                      }
                      setDraft((current) => ({
                        ...current,
                        protectedRoles: next
                          ? [...current.protectedRoles, role]
                          : current.protectedRoles.filter((entry) => entry !== role),
                      }));
                    }}
                  />
                  <span className="permission-copy">
                    <strong>{roleLabel[role]}</strong>
                    <span className="muted">{locked ? "Always protected." : "Optional extra shield."}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="panel settings-aside">
        <h2>What this channel will do</h2>
        <p className={noticeTone === "error" ? "notice error" : "notice muted"}>{notice}</p>
        <div className="actions">
          <span className={`chip ${saved.operatingMode === "live" ? "danger" : "warn"}`}>
            <PulseDot tone={saved.operatingMode === "live" ? "danger" : "warn"} active={saved.operatingMode === "live"} />
            {saved.operatingMode === "live" ? "Live" : "Shadow"}
          </span>
          {saved.emergencyStop ? <span className="chip danger">Emergency stop</span> : null}
          <span className="chip">{draft.moderationLevel}</span>
        </div>
        <table className="matrix">
          <thead>
            <tr>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {matrix[draft.moderationLevel].map(([risk, action]) => (
              <tr key={risk}>
                <td>{risk}</td>
                <td>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="plain-list">
          {!draft.allowAutomaticBans ? <li>Bans fall back to timeouts.</li> : null}
          {!draft.allowTimeouts ? <li>Timeouts fall back to deletes.</li> : null}
          {!draft.allowMessageDeletion ? <li>Deletes fall back to flags.</li> : null}
          {!draft.allowChatModeChanges ? <li>Raid chat protection stays off.</li> : null}
          {draft.allowTitleProposals ? (
            <li>Title changes stay proposals until you approve them.</li>
          ) : (
            <li>Title proposals stay off.</li>
          )}
          <li>
            Protected: {previewRoles.map((role) => roleLabel[role]).join(", ")}.
          </li>
          <li>
            {draft.allowedTerms.length} allowed terms, {draft.blockedTerms.length} blocked terms.
          </li>
        </ul>
        {formError ? <p className="notice error">{formError}</p> : null}
        <Pressable type="submit" disabled={busy || !dirty || !normalized.ok}>
          {dirty ? "Save channel settings" : "Channel settings saved"}
        </Pressable>
      </aside>
    </form>
  );
}

function TermEditor({
  fieldId,
  label,
  hint,
  terms,
  value,
  disabled,
  onValueChange,
  onAdd,
  onRemove,
}: {
  fieldId: string;
  label: string;
  hint: string;
  terms: string[];
  value: string;
  disabled: boolean;
  onValueChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (term: string) => void;
}) {
  return (
    <div className="term-editor">
      <label htmlFor={fieldId}>{label}</label>
      <div className="term-row">
        <input
          id={fieldId}
          value={value}
          disabled={disabled}
          placeholder="Add a term, or several separated by commas"
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
        />
        <Pressable type="button" className="secondary" disabled={disabled || value.trim() === ""} onClick={onAdd}>
          Add
        </Pressable>
      </div>
      <p className="muted">{hint}</p>
      {terms.length === 0 ? (
        <p className="muted">No terms yet.</p>
      ) : (
        <div className="term-list">
          <AnimatePresence initial={false}>
            {terms.map((term) => (
              <PopIn className="term-chip" key={term}>
                {term}
                <Pressable type="button" disabled={disabled} onClick={() => onRemove(term)} aria-label={`Remove ${term}`}>
                  ×
                </Pressable>
              </PopIn>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
