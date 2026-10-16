# Selling Nachtschicht

Sell to streamers first. A conversation with Twitch as a platform partner waits until usage and safety numbers exist. Live moderation is not connected yet, so the first sale is a free shadow trial. Paid enforcement starts only after that trial looks right.

The page to send a streamer is [OVERVIEW.md](OVERVIEW.md). Product rules stay in [ARCHITECTURE.md](ARCHITECTURE.md).

## What we sell

The long-term goal is to replace the staffed Twitch moderation shift. A channel should be able to run without human moderators continuously reading chat. Nachtschicht watches every message, applies the channel's rules, takes moderation actions, and records why.

That does not remove the broadcaster's authority. Unbans, appeals, emergency control, and approval of title, category, and tag proposals stay human. We sell autonomous day-to-day chat moderation, not the removal of human accountability.

The initial promise is narrower because it has to be proven safely: first reduce moderator work in shadow mode, then take over delete and timeout, then bans and chat modes. The destination is a channel that does not need a staffed moderator shift.

The buyer is the broadcaster. Moderators can champion the product. They are not the buyer.

We sell one hosted product: a subscription for one Twitch channel. We do not sell a software license. The broadcaster pays for the night shift, not for the right to run the server. Shadow and Shift are two stages of that same product. Moderation, title proposals, and the audit log stay in the one subscription. They are not separate licenses.

A self-hosted license waits until a channel refuses to put chat on our server, and only after the hosted product is already in use. It is not the first sale.

Title, category, and tags stay proposals. Unban stays human. Chat text is not used for training.

## Where it runs

Nachtschicht runs on one rented server in the EU, operated by us. Germany or Finland. The streamer's PC is the place they play and open the desk in a browser. It is not the place that receives chat.

Twitch chat arrives through an EventSub webhook (`/api/twitch/eventsub` in the build plan). That endpoint needs a public HTTPS address that stays up for the whole stream. A gaming PC sleeps, reboots for updates, and sits behind a home router. When that machine drops, the night shift drops with it, which is the hour the product is supposed to cover.

One server is shared across channels. A server per streamer is not the model. The code today stores one channel (`twitch_account` id 1, database path overridable with `NACHTSCHICHT_DB_PATH`). The first channels can each have their own process and database file on that same machine. Before the box is full, the app has to serve many channels in one process. That sharing is an engineering step. It does not change the offer.

Cost of the box, list prices after the Hetzner adjustment of 15 June 2026, excluding VAT, Germany/Finland: a CX23 is €5.49 a month (2 vCPU, 4 GB RAM, 40 GB). A CAX11 is €5.99. IPv4 is about €0.50 extra. Domain and backups round the fixed bill to about €8 a month. That €8 is for every channel on the machine together. It is not €8 per channel.

4 GB of RAM holds a handful of separate Next.js processes, not 20. The €8 machine covers the first beta channels. A larger machine comes when the processes no longer fit, and it is still one shared bill.

The gap next to ChatMod, Alesha, StreamChat AI, Nexmod, Nightbot, and Twitch AutoMod is this combination: a German product, shadow mode before live enforcement, an audit log, full chat actions, and title proposals that publish only after approval. "First AI moderator" is not a sales claim. Chat AI is already a crowded category.

Public prices checked on 3 October 2026:

| Product | What it already does | Public price | Gap we sell into |
| --- | --- | --- | --- |
| [ChatMod](https://chatmod.myriadic.org/) | Reads each message, Twitch rules plus custom instructions, near real time. Higher tiers advertise live audio. | $0 / 5,000 messages, $9 / 50,000, $49 / 500,000, $249 / 5 million, $449 / 10 million | No advertised "title only after approval" plus a German privacy focus |
| [Alesha AI](https://aleshaai.com/for/twitch) | AI co-host. On Twitch: delete, timeout, configurable ban thresholds, translation. | Twitch advertised free, Pro $12.99 | Co-host, not a moderator with an approval gate |
| [StreamChat AI](https://www.streamchat.ai/uses/ai-moderation-bot-for-twitch) | Context, warning, timeout, ban, escalation, raid protection, log, plus commands and OBS | Free tier with a cap on AI messages | Larger bot, different safety model |
| [Nexmod](https://nexmod.app/) | Cloud dashboard, commands, filters, automations, OBS | €0, €10, €25 | Current page describes rule filters, not a documented LLM moderator |
| Nightbot, StreamElements, Fossabot, Moobot, Sery_Bot | Mostly free and rule-based. StreamElements and Nightbot change title, category, and tags by chat command | Free | Title changes are commands, not an AI proposal with approval |
| Twitch AutoMod | Holds risky messages for a human | Free | No timeout, no ban, no stream metadata |

## Who the first channels are

The first 10 to 20 channels, German or English:

- A typical stream with 0 to 2 moderators.
- Chat that tips without a moderator: raids, solo streams, late shifts.
- A broadcaster who will compare decisions for two weeks before anything is deleted.

A channel is qualified when we have the channel name, the chat language, the moderator count, and a yes to trying the desk. Someone who only wants to talk stays on the list and does not get a live connection.

## Price

| Tier | Price | What the channel gets |
| --- | --- | --- |
| Shadow | €0 for 14 days | Scoring and audit. No delete, timeout, or ban. |
| Shift | €12 / month, tested inside €9–15 | Delete and timeout, with a message cap |
| Night shift | Later, only with measured accuracy | Bans, a higher message cap, team features, or stream control |

€12 is what the streamer pays per month. It sits next to ChatMod's first paid tier ($9 / 50,000 messages) and Alesha Pro ($12.99). The server is already inside that price. There is no separate hosting fee, and the price does not drop if someone offers to run it on their own PC.

If 19% VAT is included in the €12, about €10.08 is left before costs. Whether VAT is charged depends on the tax setup and has to be settled before the first invoice.

| Cost | At 1 paying channel | At 10 paying channels |
| --- | --- | --- |
| Shared EU server, domain, backups | about €8 fixed | about €0.80 each |
| Card fee, roughly 1.5% + €0.25 | about €0.43 | about €0.43 |
| Heuristic scoring | €0 | €0 |
| LLM, only once it scores uncertain cases | see below | see below |

While the heuristic is the only scorer, one paying channel barely covers the server (about €10 minus €8 minus the card fee). The second channel does not add a second server. At ten channels the server is under €1 each, and most of the €10 remains.

The model is the cost that can break €12. It is not wired yet, and the plan uses it only for uncertain messages. A planning figure, not a provider quote: 50,000 messages in a month, one in five sent to a small model, on the order of €1 to €2 for that channel. The message cap exists so a busy chat cannot turn that into the whole subscription. Measure it on the shadow channels before treating €12 as final.

A higher tier waits until accuracy, team features, or stream control are measurably better. Before the first invoice: GDPR, a data-processing agreement, the Twitch Developer Agreement, imprint, privacy policy, and terms.

## How a sale runs

Personal demos. No ads.

1. **Outreach.** Send [OVERVIEW.md](OVERVIEW.md). Ask for channel name, chat language, moderators on a typical stream, and whether they want to try the desk or only talk.
2. **Demo, 20 minutes.** Their chat, or the demo on the desk. Show shadow mode, the emergency stop, the audit log, protected roles, and title approval. Show one wrong decision out loud and show why it is in the log.
3. **Shadow agreement.** 14 days of watching only. State what is stored, that chat is not used for training, and that they can stop at any time. Once a week, read five decisions together: right, wrong, and jokes or slang that must stay.
4. **Go-live.** Delete and timeout only when the false-positive rate on that channel is acceptable and the broadcaster turns the level on. Bans come last.
5. **Invoice.** Monthly from the day delete or timeout goes live. Shadow stays free.

Acquisition order: personal contacts, German and English moderator communities, one case study from the best shadow channel, creator agencies after three case studies.

## Ninety days

The desk runs locally. OAuth, Helix, and EventSub are the next build steps. Without that connection there is no paid live moderator.

| Weeks | Product | Sales |
| --- | --- | --- |
| 1–4 | OAuth, delete, timeout, ban, EventSub | Five channels agree to enter shadow as soon as the connection works. No invoice yet. |
| 5–8 | Ten channels in shadow, weekly review | House rules and word lists come from those reviews. One case study, only with the channel's permission. |
| 9–12 | Three to five channels on delete and timeout, if quality holds | First €12 subscriptions. Bans stay off. |

Before a Twitch conversation, have: active channels, retention, messages moderated, fewer manual actions, false-positive rate, and reaction time.

## What a case study has to carry

Per channel: messages scored in shadow, the share of decisions the broadcaster would have left as they were, false positives, time to decision, and whether the channel paid afterward. A number without the channel's permission is a claim. A number the broadcaster approved is the material for the next channel.
