---
title: Moderationsstufen
tags:
  - nachtschicht
  - technik
created: 2026-10-05
updated: 2026-10-05
---

# Moderationsstufen

Regelversion `policy-v2` in `lib/policy.ts`. Zurück zur [[Nachtschicht|Startseite]]. Der Fluss steht in [[Aufbau]].

| Risiko | Aktion | Grenze |
| --- | --- | --- |
| Keins | Ignorieren | Kein Eingriff |
| Niedrig | Nur markieren | Geht nicht an Twitch |
| Mittel | Löschen | |
| Hoch | Timeout | 60 Sekunden, verdoppelt sich bei Wiederholung, gedeckelt durch `maxTimeoutSeconds`. Ab dem dritten Treffer mit hoher Sicherheit Ban |
| Schwer | Permanenter Ban | Erst ab 85 % Sicherheit, sonst Timeout. Abschaltbar über `allowAutomaticBans` |

Raid mit ausgeführtem Timeout oder Ban schaltet zusätzlich Follower-Only.

Mods und der Broadcaster werden nur markiert. Shadow Mode und Not-Aus halten jede Aktion an und schreiben sie ins Protokoll. Diese Grenzen kommen aus [[Entscheidungen]].
