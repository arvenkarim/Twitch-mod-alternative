# Nachtschicht documentation

This is how to run and use the moderation desk. The page you can send to streamers is [OVERVIEW.md](OVERVIEW.md). Product rules and the remaining build plan are in [ARCHITECTURE.md](ARCHITECTURE.md). Sales is in [MARKETING.md](MARKETING.md).

## What you are running

Nachtschicht scores Twitch chat and chooses ignore, flag, delete, timeout, or ban. Title, category, and tags are proposals until the broadcaster approves them. Moderators and the broadcaster are flagged, never punished. Shadow mode and the emergency stop hold every action, and the decision is still written to the audit log.

Without Twitch credentials the desk stays in demo mode and does not call Twitch.

## Run it

Requires Node.js with npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `npm run dev` | Desk at http://localhost:3000 |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |
| `npm run replay` | Labeled corpus, with a printed report |
| `npm run build` | Production build |

## Desk

The home page is the live desk.

- **Shadow / Live** switches whether allowed actions may be carried out. Shadow only scores and logs.
- **Emergency stop** holds every action until you release it.
- **Run demo chat** feeds a fixed set of messages through the same path as real chat.
- **Score message** lets you type one message, pick a role, and see the decision.
- **Replay bench** runs the labeled corpus in its own database, in shadow mode.
- **Stats** show the current mode, moderation level, and counts of messages, flags, and executed actions.
- **Permissions** on the desk are the ceiling: delete, timeout, ban, chat modes, and title proposals. Turning one off makes the action softer. It never makes it harsher.
- **Title proposal** can be approved or rejected. Approval is what publishes it. Today that publish step is still the demo adapter.
- **Audit** lists each decision with reason, confidence, model version, and rule version.

## Channel settings

Open **Channel settings** in the sidebar. Shadow, live, and the emergency stop apply immediately. The rest of the page saves together.

- Moderation level: relaxed, balanced, or strict.
- Permission ceiling, same switches as the desk.
- House rules, allowed terms, and blocked terms.
- Protected roles. Broadcaster and moderator stay protected even if a save omits them.
- Maximum timeout is a whole number of seconds from 30 up to 14 days.

## Broadcaster commands

The parser accepts these from a verified broadcaster only. Message text alone is not enough. They are not wired into incoming chat yet, so typing them in the test box does not change settings.

- `!aimod stop` turns the emergency stop on.
- `!aimod start` releases it and goes live.
- `!aimod shadow` scores only.
- `!aimod live` allows chat actions.
- `!aimod approve` approves the open title proposal.
- `!aimod reject` rejects it.
- `!aimod unban <login>` is the human unban. The scorer cannot emit this.

## Environment

Copy `.env.example` to `.env.local`. Leave the Twitch values empty to stay in demo mode.

| Variable | Required | Purpose |
| --- | --- | --- |
| `TWITCH_CLIENT_ID` | For Twitch | Helix application id |
| `TWITCH_CLIENT_SECRET` | For Twitch | Helix application secret |
| `TWITCH_REDIRECT_URI` | For Twitch | Defaults to `http://localhost:3000/api/twitch/callback` |
| `TWITCH_BOT_USER_ID` | For Twitch | User id of the moderator account |
| `MCP_API_TOKEN` | No | Enables `POST /api/mcp`. At least 32 characters. Empty disables the endpoint. |
| `TOKEN_ENCRYPTION_KEY` | Before real tokens are stored | Key for OAuth tokens at rest |
| `NACHTSCHICHT_DB_PATH` | No | Overrides `data/nachtschicht.sqlite` |

`TOKEN_ENCRYPTION_KEY` and `EVENTSUB_SECRET` are part of the Twitch connection that is still being built. Do not commit `.env.local`.

## HTTP API

Routes validate input and return JSON. They run on the Node.js runtime.

| Method and path | Body | Result |
| --- | --- | --- |
| `GET /api/dashboard` | none | Current desk snapshot |
| `POST /api/chat` | `userId`, `username`, `role`, `text`, optional `language` | One scored message |
| `POST /api/demo` | none | The demo scenarios, scored |
| `POST /api/settings` | At least one channel setting | Saved settings, or `400` |
| `POST /api/title` | `{ "status": "approved" }` or `"rejected"` | Updated proposal |
| `POST /api/replay` | none | Replay report from `data/replay.sqlite` |
| `GET /api/twitch/start` | none | Redirect to Twitch when credentials exist, otherwise `400` |
| `GET /api/twitch/callback` | none | Reserved. It does not exchange a code yet. |
| `POST /api/mcp` | JSON-RPC | Read-only desk tools. `503` when `MCP_API_TOKEN` is unset. |

Roles for `POST /api/chat` are `viewer`, `subscriber`, `vip`, `moderator`, and `broadcaster`.

The MCP tools are `get_channel_status`, `get_pending_proposal`, `list_audit`, and `list_recent_messages`. They cannot delete, timeout, ban, change settings, or approve a title. Clients send `Authorization: Bearer <MCP_API_TOKEN>`. A browser `Origin` that does not match the host is rejected.

## Data

The desk database is `data/nachtschicht.sqlite`. The replay bench uses `data/replay.sqlite` and does not reset the desk database. Both files are git-ignored. Schema changes must keep an existing local database working.

## Checks before you finish a change

- `npm test` passes. Policy, command parsing, and signature changes get a test in `lib/*.test.ts`.
- `npx tsc --noEmit` and `npm run lint` are clean.
- A new dashboard or settings field is filled in the database, the moderation layer, the desk, and the test fixtures.
- API routes return a `4xx` JSON body for bad input.
- Chat text stays untrusted. Twitch actions stay behind the policy engine.

## What is not live yet

Sign-in token exchange, real Twitch bans and deletes, incoming EventSub chat, applying `!aimod` during ingest, the unban control, an LLM for uncertain messages, and retention export or delete. The order is in [ARCHITECTURE.md](ARCHITECTURE.md).
