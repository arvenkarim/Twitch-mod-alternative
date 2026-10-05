# Nachtschicht

German Twitch AI moderator copilot. The bot reviews chat like a human moderator, can delete messages, timeout users, and ban severe violations. Stream title, category, and tags stay in proposal mode until the broadcaster approves them.

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
