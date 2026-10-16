# Nachtschicht

Twitch AI moderator for German and English channels. The bot reviews chat like a human moderator, can delete messages, timeout users, and ban severe violations. Stream title, category, and tags stay in proposal mode until the broadcaster approves them.

How to run and use the desk is in [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md). Product rules and the remaining build plan are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). A page you can send to streamers or collaborators is in [docs/OVERVIEW.md](docs/OVERVIEW.md). Who we sell to and how is in [docs/MARKETING.md](docs/MARKETING.md).

## What the MVP does

- Scores incoming chat for spam, toxicity, harassment, hate, raids, and channel blocklists.
- Applies a deterministic policy: ignore, flag, delete, timeout, or ban.
- Protects moderators and the broadcaster from automatic punishments.
- Starts in Shadow Mode so you can inspect decisions before going live.
- Suggests title and category changes, but never publishes them automatically.

## Run it

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), start the demo chat, then approve or reject the Valorant title proposal.

## Twitch connection

Copy `.env.example` to `.env.local` and fill the Twitch app credentials when you want Helix API calls instead of the local demo adapter. Until those values exist, the dashboard stays fully usable in demo mode.

## MCP server (read-only)

`POST /api/mcp` exposes the desk to MCP clients over Streamable HTTP (stateless, JSON responses). It can read status, the audit log, recent chat, and the pending title proposal. It cannot moderate, change settings, or publish titles.

Set `MCP_API_TOKEN` in `.env.local` (at least 32 characters, e.g. `openssl rand -hex 32`). Without it the endpoint answers `503`. Clients send `Authorization: Bearer <token>`. Example for Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "nachtschicht": {
      "url": "http://localhost:3000/api/mcp",
      "headers": { "Authorization": "Bearer ${env:NACHTSCHICHT_MCP_TOKEN}" }
    }
  }
}
```
