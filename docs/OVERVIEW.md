# Nachtschicht

Nachtschicht is built to replace the staffed moderation shift in Twitch chat. It reads every message, decides what a human moderator would do, takes the allowed action, and writes down why. The goal is that a channel no longer needs moderators continuously watching chat. The broadcaster still controls the stream, appeals, unbans, and the emergency stop.

You can send this page to a streamer, a moderator, or someone who wants to build with us. The build plan for the team stays in `docs/ARCHITECTURE.md`.

## What it does in chat

It scores spam, toxicity, harassment, hate, raids, and the channel's own blocklist. A fixed set of rules then chooses one action:

- ignore
- flag, for a human to see
- delete
- timeout
- ban

The streamer picks how firm that is: relaxed, balanced, or strict. They can also turn individual powers off. If bans are off, a ban becomes a timeout. If timeouts are off, it becomes a delete. If deletes are off, it becomes a flag.

Chat modes such as follower-only are available only when the streamer allows them.

## What it never does on its own

- It does not change the stream title, category, or tags. It can propose them. They go live only after the broadcaster approves them on the desk, or with a verified `!aimod approve`.
- It does not punish the broadcaster or moderators. Those messages are flagged and left alone.
- It does not unban anyone. Unban is a human action.
- It does not train a model on your chat.
- A viewer message cannot change settings or issue commands. `!aimod` works only when Twitch confirms the sender is the broadcaster.

## How you stay in control

The desk starts in **shadow mode**. Nachtschicht scores chat and keeps the log. It does not delete, timeout, or ban until you switch to live.

**Emergency stop** holds every action immediately. The decision is still written down.

Every decision keeps a reason, a confidence score, the model version, and the rule version. You can read what happened after the stream.

A channel goes live in stages: replay past chat, run shadow on the live channel, allow delete and timeout, and only then allow bans. Title proposals stay proposals at every stage.

## What you can see today

As of October 2026 the moderation desk runs on your own machine. You can set house rules, allowed and blocked terms, protected roles, and the permission ceiling. You can run a demo chat and a labeled replay, then inspect the audit log.

Live Twitch actions are the next step. Until the Twitch connection is finished, the desk does not call Twitch. A channel is not moderated on Twitch yet.

## If you want to use it

We are looking for a small group of German and English channels with fast chat and few moderators.

A useful first step is a shadow trial: Nachtschicht watches, you compare its decisions with what your mods would have done, and nothing is enforced. Delete and timeout come later, and only if that trial looks right. Bans come last.

Write back to the person who sent you this page and tell us:

- the channel name
- the usual chat language
- how many moderators you have on a typical stream
- whether you want to try the desk, or only talk

## If you want to work with us

The product rules above are closed. Help that moves the channel onto Twitch is welcome.

- **Streamers and moderators** can tell us which decisions feel wrong, and which jokes, slang, and quotes must stay in chat.
- **Engineers** can help connect Twitch: sign-in, live delete, timeout, and ban, and receiving chat from Twitch. The rules that decide an action stay in our own code. The model does not get those tools.

Reply to the person who sent you this page and say what you want to take on.
