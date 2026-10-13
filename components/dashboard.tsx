"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReplayCaseResult, ReplayReport } from "@/lib/replay";
import type { ChannelRole, DashboardSnapshot } from "@/lib/types";

const groupLabel: Record<ReplayCaseResult["group"], string> = {
  slang: "Slang",
  greeting: "Small talk",
  spam: "Spam",
  toxicity: "Insult",
  harassment: "Harassment",
  hate: "Hate",
  raid: "Raid",
  sexual: "Sexual",
  protected: "Protected role",
  command: "Command",
  prompt_injection: "Prompt injection",
  quote: "Quote",
  sarcasm: "Sarcasm",
  allowlist_bypass: "Allowlist",
  multilingual: "Multilingual",
  title: "Title",
};

const actionTone: Record<string, string> = {
  ignore: "ok",
  flag: "warn",
  warn: "warn",
  delete: "warn",
  timeout: "danger",
  ban: "danger",
};

const moderationLevelLabel = {
  relaxed: "Relaxed",
  balanced: "Balanced",
  strict: "Strict",
} as const;

export function Dashboard({ initialSnapshot }: { initialSnapshot: DashboardSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [username, setUsername] = useState("demo_viewer");
  const [role, setRole] = useState<ChannelRole>("viewer");
  const [text, setText] = useState("switching to valorant ranked after this game");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(
    initialSnapshot.settings.operatingMode === "live"
      ? "Live mode is on. Deletes, timeouts, and bans are marked as executed."
      : "Shadow mode is on. The AI scores chat, but does not act in the live chat yet.",
  );
  const [replay, setReplay] = useState<ReplayReport | null>(null);

  const liveLabel = snapshot.settings.operatingMode === "live" ? "Live" : "Shadow";

  const pending = snapshot.pendingProposal;
  const lastAction = snapshot.audit[0];

  const stats = useMemo(
    () => ({
      messages: snapshot.recentMessages.length,
      actions: snapshot.audit.filter((item) => item.executed).length,
      flags: snapshot.audit.filter((item) => item.action === "flag").length,
    }),
    [snapshot],
  );
  const timeouts = snapshot.audit.filter((item) => item.action === "timeout");

  async function refresh() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    setSnapshot(await response.json());
  }

  async function run(path: string, body?: unknown) {
    setBusy(true);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        throw new Error("request failed");
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateSetting(body: Record<string, unknown>) {
    await run("/api/settings", body);
    setNotice("Moderation settings saved.");
  }

  async function playReplay() {
    setBusy(true);
    try {
      const response = await fetch("/api/replay", { method: "POST" });
      const body = (await response.json()) as ReplayReport | { error?: string };
      if (!response.ok || !("cases" in body)) {
        throw new Error("request failed");
      }
      setReplay(body);
      setNotice(
        body.lockedFailed > 0
          ? `Replay bench: ${body.lockedFailed} locked cases drifted. ${body.watchMissed} known gaps.`
          : `Replay bench: ${body.lockedPassed} locked cases passed. ${body.watchMissed} known gaps remain.`,
      );
    } catch {
      setReplay(null);
      setNotice("The replay bench could not run the corpus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Live desk</p>
          <h1>Channel moderation</h1>
          <p className="lede">
            Each message gets a verdict. Policy decides whether to delete, time out, or ban. Title, category, and
            tags stay proposals until you approve them.
          </p>
        </div>
        <div className="actions">
          <span className={`chip ${snapshot.settings.operatingMode === "live" ? "danger" : "warn"}`}>{liveLabel}</span>
          <button
            className="secondary"
            disabled={busy}
            onClick={async () => {
              await run("/api/settings", {
                operatingMode: snapshot.settings.operatingMode === "live" ? "shadow" : "live",
              });
              setNotice(
                snapshot.settings.operatingMode === "live"
                  ? "Back in shadow mode. Actions are logged only."
                  : "Live mode is on. Deletes, timeouts, and bans are marked as executed.",
              );
            }}
          >
            {snapshot.settings.operatingMode === "live" ? "Switch to shadow" : "Switch to live"}
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              await run("/api/demo");
              setNotice("Demo chat scored: spam, toxicity, hate, a protected moderator, and a title proposal.");
            }}
          >
            Run demo chat
          </button>
        </div>
      </header>

      <section className="stat-row" aria-label="Desk status">
        <article className="stat">
          <span>Mode</span>
          <strong>{liveLabel}</strong>
        </article>
        <article className="stat">
          <span>Level</span>
          <strong>{moderationLevelLabel[snapshot.settings.moderationLevel]}</strong>
        </article>
        <article className="stat">
          <span>Messages</span>
          <strong>{stats.messages}</strong>
        </article>
        <article className="stat">
          <span>Flagged</span>
          <strong>{stats.flags}</strong>
        </article>
        <article className="stat">
          <span>Executed</span>
          <strong>{stats.actions}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="meta">
          <h2>Replay bench</h2>
          <button type="button" disabled={busy} onClick={() => void playReplay()}>
            Run corpus
          </button>
        </div>
        <p className="muted">
          The corpus runs in its own database in shadow mode. Every decision is logged.
          Twitch is not contacted, and the stream title stays a proposal.
        </p>
        {replay ? (
          <>
            <div className="actions">
              <span className="chip ok">Locked {replay.lockedPassed}</span>
              <span className={`chip ${replay.lockedFailed > 0 ? "danger" : ""}`}>Drift {replay.lockedFailed}</span>
              <span className="chip warn">Gaps {replay.watchMissed}</span>
              <span className="chip">Shadow</span>
            </div>
            <div className="replay-scroll">
              <table className="replay-table">
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Group</th>
                    <th>Action</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {replay.cases.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.username}</strong>
                        <div>{item.text}</div>
                      </td>
                      <td>{groupLabel[item.group]}</td>
                      <td>
                        {item.category} · {item.action}
                      </td>
                      <td>
                        <span className={`chip ${replayTone(item)}`}>{replayLabel(item)}</span>
                        {item.matches ? null : (
                          <div className="muted">
                            Expected: {item.expectedCategory} · {item.expectedAction}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="muted">No run yet. The dashboard log stays unchanged.</p>
        )}
      </section>

      <section className="grid settings-grid">
        <div className="panel">
          <h2>Chat mode</h2>
          <p className="muted">The level chooses the response. Your individual permissions set the hard ceiling.</p>
          <label>
            Moderation level
            <select
              value={snapshot.settings.moderationLevel}
              disabled={busy}
              onChange={(event) =>
                void updateSetting({ moderationLevel: event.target.value })
              }
            >
              <option value="relaxed">Relaxed — flag instead of punishing</option>
              <option value="balanced">Balanced — default rules</option>
              <option value="strict">Strict — delete and timeout earlier</option>
            </select>
          </label>
          <p className="mode-description">
            <strong>{moderationLevelLabel[snapshot.settings.moderationLevel]}</strong>
            {" · "}
            {snapshot.settings.moderationLevel === "relaxed"
              ? "Spam is flagged, and severe violations are timed out at most."
              : snapshot.settings.moderationLevel === "strict"
                ? "Light violations are deleted, spam is timed out, and severe violations can be banned."
                : "Spam is deleted, harassment is timed out, and severe violations can be banned."}
          </p>
          <label>
            Maximum timeout in seconds
            <input
              type="number"
              min={30}
              max={1_209_600}
              key={snapshot.settings.maxTimeoutSeconds}
              defaultValue={snapshot.settings.maxTimeoutSeconds}
              disabled={busy}
              onBlur={(event) => {
                const value = Number(event.target.value);
                if (Number.isInteger(value) && value >= 30 && value <= 1_209_600) {
                  void updateSetting({ maxTimeoutSeconds: value });
                } else {
                  event.target.value = String(snapshot.settings.maxTimeoutSeconds);
                }
              }}
            />
          </label>
        </div>

        <div className="panel">
          <h2>What the bot may do</h2>
          <div className={`emergency-card ${snapshot.settings.emergencyStop ? "active" : ""}`}>
            <div>
              <strong>Emergency stop</strong>
              <div className="muted">
                {snapshot.settings.emergencyStop
                  ? "On: every action is held and only logged."
                  : "Off: permitted actions may execute in live mode."}
              </div>
            </div>
            <button
              type="button"
              className={snapshot.settings.emergencyStop ? "secondary" : "danger"}
              disabled={busy}
              onClick={() =>
                void updateSetting({ emergencyStop: !snapshot.settings.emergencyStop })
              }
            >
              {snapshot.settings.emergencyStop ? "Release stop" : "Activate stop"}
            </button>
          </div>
          <div className="permission-list">
            <PermissionToggle
              label="Delete messages"
              checked={snapshot.settings.allowMessageDeletion}
              disabled={busy}
              onChange={(checked) => void updateSetting({ allowMessageDeletion: checked })}
            />
            <PermissionToggle
              label="Timeout users"
              checked={snapshot.settings.allowTimeouts}
              disabled={busy}
              onChange={(checked) => void updateSetting({ allowTimeouts: checked })}
            />
            <PermissionToggle
              label="Ban users automatically"
              checked={snapshot.settings.allowAutomaticBans}
              disabled={busy}
              onChange={(checked) => void updateSetting({ allowAutomaticBans: checked })}
            />
            <PermissionToggle
              label="Set chat protection such as follower-only mode"
              checked={snapshot.settings.allowChatModeChanges}
              disabled={busy}
              onChange={(checked) => void updateSetting({ allowChatModeChanges: checked })}
            />
            <PermissionToggle
              label="Create title and category proposals"
              checked={snapshot.settings.allowTitleProposals}
              disabled={busy}
              onChange={(checked) => void updateSetting({ allowTitleProposals: checked })}
            />
          </div>
          <p className="muted">
            Title changes stay proposals even when this is on. You still confirm publication yourself. House rules,
            word lists, and protected roles are in <Link href="/settings">Channel settings</Link>.
          </p>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Scoring</h2>
          <div className="actions">
            <span className="chip">{snapshot.aiRuntime.modelVersion}</span>
            <span className="chip ok">Local verdict</span>
          </div>
          <p className="muted">
            Scoring stays inside the app and returns a category, risk, and confidence. It has no Twitch tools, so
            it cannot skip policy, shadow mode, or the audit log. Token use appears here only after a language
            model is connected the same way.
          </p>
        </div>

        <div className="panel">
          <h2>Timeout log</h2>
          {timeouts.length === 0 ? (
            <p className="muted">No timeout decision yet.</p>
          ) : (
            <div className="list">
              {timeouts.slice(0, 5).map((item) => (
                <div className="card" key={`timeout-${item.id}`}>
                  <div className="meta">
                    <strong>{item.username}</strong>
                    <span className="chip danger">
                      {item.timeoutSeconds ?? 0}s · {item.executed ? "executed" : "held"}
                    </span>
                  </div>
                  <p>{item.category} · confidence {Math.round(item.confidence * 100)}%</p>
                  <p className="muted">{item.reason}</p>
                  <small className="muted">
                    {item.modelVersion} · {item.ruleVersion} · {new Date(item.createdAt).toLocaleString("en-US")}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Review chat</h2>
          <p className="muted">{notice}</p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await run("/api/chat", { userId: username, username, role, text });
              setNotice(`Scored the message from ${username}.`);
            }}
          >
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" />
            <select value={role} onChange={(event) => setRole(event.target.value as ChannelRole)}>
              <option value="viewer">Viewer</option>
              <option value="subscriber">Subscriber</option>
              <option value="vip">VIP</option>
              <option value="moderator">Moderator</option>
              <option value="broadcaster">Broadcaster</option>
            </select>
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} />
            <button disabled={busy} type="submit">
              Score message
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Stream shield</h2>
          <p>
            <strong>{snapshot.stream.title}</strong>
          </p>
          <p className="muted">
            {snapshot.stream.category} · {snapshot.stream.tags.join(", ")}
          </p>
          <div className="actions">
            <span className="chip">Messages {stats.messages}</span>
            <span className="chip warn">Flagged {stats.flags}</span>
            <span className="chip danger">Executed {stats.actions}</span>
          </div>
          {pending ? (
            <div className="card proposal">
              <div className="meta">
                <strong>Title proposal</strong>
                <span className="chip warn">Approval required</span>
              </div>
              <p>
                {pending.title} · {pending.category}
              </p>
              <p className="muted">{pending.reason}</p>
              <div className="actions">
                <button
                  disabled={busy}
                  onClick={async () => {
                    await run("/api/title", { status: "approved" });
                    setNotice("Title change published.");
                  }}
                >
                  Approve
                </button>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={async () => {
                    await run("/api/title", { status: "rejected" });
                    setNotice("Title proposal rejected.");
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <p className="muted proposal-empty">No open title proposal.</p>
          )}
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Recent messages</h2>
          <div className="list">
            {snapshot.recentMessages.length === 0 ? (
              <p className="muted">No chat yet. Run the demo or send a test message.</p>
            ) : (
              snapshot.recentMessages.map((item) => (
                <div className="card" key={item.id}>
                  <div className="meta">
                    <strong>
                      {item.username} · {item.role}
                    </strong>
                    <span className="chip">{new Date(item.createdAt).toLocaleTimeString("en-US")}</span>
                  </div>
                  <p>{item.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Audit log</h2>
          {lastAction ? (
            <p className="muted">
              Latest decision: {lastAction.action} for {lastAction.username}.
            </p>
          ) : null}
          <div className="list">
            {snapshot.audit.map((item) => (
              <div className="card" key={item.id}>
                <div className="meta">
                  <strong>
                    {item.username} · {item.action}
                  </strong>
                  <span className={`chip ${actionTone[item.action] ?? ""}`}>
                    {item.executed ? "executed" : "scored only"}
                  </span>
                </div>
                <p>{item.text}</p>
                <p className="muted">{item.reason}</p>
                <small className="muted">
                  {item.category} · confidence {Math.round(item.confidence * 100)}%
                  {item.timeoutSeconds ? ` · ${item.timeoutSeconds}s Timeout` : ""}
                  {" · "}
                  {item.modelVersion} · {item.ruleVersion}
                </small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function replayTone(item: ReplayCaseResult) {
  if (item.matches) {
    return "ok";
  }
  if (item.status === "watch") {
    return "warn";
  }
  return "danger";
}

function replayLabel(item: ReplayCaseResult) {
  if (item.matches) {
    return "Pass";
  }
  if (item.status === "watch") {
    return "Gap";
  }
  return "Drift";
}

function PermissionToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="permission-toggle">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
