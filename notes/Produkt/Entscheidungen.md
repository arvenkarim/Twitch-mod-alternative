---
title: Entscheidungen
tags:
  - nachtschicht
  - produkt
created: 2026-10-03
updated: 2026-10-05
---

# Entscheidungen

Gilt für das MVP. Zurück zur [[Nachtschicht|Startseite]].

- Zuerst ein technisches MVP plus Vermarktung, kein reiner Pitch und kein Wegwerf-Prototyp.
- Verkauf zuerst an Streamer. Twitch als Plattformpartner erst mit belegter Nutzung und Sicherheit. Details in [[Vermarktung]].
- Chat ist voll selbstständig: warnen, löschen, Timeout, permanenter Ban, Chat leeren, Slow-Mode, Follower-, Sub- und Emote-Only. Stufen in [[Moderationsstufen]].
- Titel, Kategorie und Tags liest die KI mit. Veröffentlicht wird nur nach Freigabe im Dashboard oder durch einen bestätigten Broadcaster-Befehl. Befehle in [[Befehle]].
- Mods und der Broadcaster werden nie automatisch bestraft, nur markiert.
- Shadow Mode und Not-Aus halten jede Aktion an. Die Entscheidung bleibt im Protokoll.
- Unban nur durch einen Menschen. Die KI hebt eigene Bans nicht stillschweigend auf.
- Chat-Text ist untrusted. `!aimod` gilt nur, wenn der Absender als Broadcaster über User-ID oder Badge geprüft ist.
- Die KI liefert nur ein Urteil. Die Regeln in `lib/policy.ts` entscheiden, `lib/twitch.ts` führt aus. Fluss in [[Aufbau]].
- Jede Entscheidung schreibt ein Audit mit Grund, Konfidenz, Modellversion und Regelversion.
- Ohne Twitch-Zugangsdaten bleibt die App im Demo-Modus und ruft Twitch nicht auf.
- Chatdaten werden standardmäßig nicht zum Training verwendet. Vor einem öffentlichen Start: DSGVO, Auftragsverarbeitung und Twitch Developer Agreement juristisch prüfen. Prüfpunkte in [[Qualität]].

> [!warning] Frühere Variante, verworfen
> Zuerst war geplant, permanente Bans nur nach Streamer-Freigabe zu erlauben. Das gilt nicht mehr. Bans im Chat sind selbstständig. Die Freigabe bleibt bei Titel, Kategorie und Tags.
