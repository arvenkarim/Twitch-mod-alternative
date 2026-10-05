"use client";

import { useMemo, useState } from "react";
import type { ChannelRole, DashboardSnapshot } from "@/lib/types";

const actionTone: Record<string, string> = {
  ignore: "ok",
  flag: "warn",
  warn: "warn",
  delete: "warn",
  timeout: "danger",
  ban: "danger",
};

export function Dashboard({ initialSnapshot }: { initialSnapshot: DashboardSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [username, setUsername] = useState("demo_viewer");
  const [role, setRole] = useState<ChannelRole>("viewer");
  const [text, setText] = useState("switching to valorant ranked after this game");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(
    initialSnapshot.settings.operatingMode === "live"
      ? "Live Mode aktiv. Löschen, Timeouts und Bans werden als ausgeführt markiert."
      : "Shadow Mode ist aktiv. Die KI bewertet, greift aber noch nicht in den Live-Chat ein.",
  );

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

  return (
    <div className="layout">
      <section className="hero">
        <div>
          <p className="chip">Nachtschicht</p>
          <h1>KI-Moderator für Twitch-Chat</h1>
          <p className="muted">
            Die KI handelt im Chat wie ein echter Mod: löschen, timeouten und bei schweren Verstößen bannen.
            Titel, Kategorie und Tags erscheinen erst nach deiner Freigabe.
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
                  ? "Zurück im Shadow Mode. Aktionen werden nur protokolliert."
                  : "Live Mode aktiv. Löschen, Timeouts und Bans werden als ausgeführt markiert.",
              );
            }}
          >
            {snapshot.settings.operatingMode === "live" ? "Shadow Mode" : "Live Mode"}
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              await run("/api/demo");
              setNotice("Demo-Chat wurde bewertet: Spam, Toxizität, Hate, geschützter Mod und Titelvorschlag.");
            }}
          >
            Demo-Chat starten
          </button>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Chat bewerten</h2>
          <p className="muted">{notice}</p>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await run("/api/chat", { userId: username, username, role, text });
              setNotice(`Nachricht von ${username} bewertet.`);
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
              Nachricht prüfen
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Stream-Schild</h2>
          <p>
            <strong>{snapshot.stream.title}</strong>
          </p>
          <p className="muted">
            {snapshot.stream.category} · {snapshot.stream.tags.join(", ")}
          </p>
          <div className="actions">
            <span className="chip">Nachrichten {stats.messages}</span>
            <span className="chip warn">Markiert {stats.flags}</span>
            <span className="chip danger">Ausgeführt {stats.actions}</span>
          </div>
          {pending ? (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="meta">
                <strong>Titelvorschlag</strong>
                <span className="chip warn">Freigabe nötig</span>
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
                    setNotice("Titeländerung veröffentlicht.");
                  }}
                >
                  Freigeben
                </button>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={async () => {
                    await run("/api/title", { status: "rejected" });
                    setNotice("Titelvorschlag verworfen.");
                  }}
                >
                  Ablehnen
                </button>
              </div>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>
              Kein offener Titelvorschlag.
            </p>
          )}
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Letzte Nachrichten</h2>
          <div className="list">
            {snapshot.recentMessages.length === 0 ? (
              <p className="muted">Noch kein Chat. Starte die Demo oder sende eine Testnachricht.</p>
            ) : (
              snapshot.recentMessages.map((item) => (
                <div className="card" key={item.id}>
                  <div className="meta">
                    <strong>
                      {item.username} · {item.role}
                    </strong>
                    <span className="chip">{new Date(item.createdAt).toLocaleTimeString("de-DE")}</span>
                  </div>
                  <p>{item.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Audit-Log</h2>
          {lastAction ? (
            <p className="muted">
              Letzte Entscheidung: {lastAction.action} für {lastAction.username}.
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
                    {item.executed ? "ausgeführt" : "nur bewertet"}
                  </span>
                </div>
                <p>{item.text}</p>
                <p className="muted">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
