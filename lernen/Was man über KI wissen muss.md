# Was man über KI wissen muss

Zurück: [Lernen](Lernen.md) · Vorher: [LLM Vor- und Nachteile](<LLM Vor- und Nachteile.md>) · Weiter: [Karteikarten](Karteikarten.md)

## Die 10 wichtigsten Erkenntnisse
1. **KI ist Statistik, keine Magie.** Modelle erkennen Muster in Daten, sie „denken“ nicht wie Menschen.
2. **Daten bestimmen das Modell.** Qualität, Menge und Bias der Daten bestimmen die Qualität der KI.
3. **LLMs sagen das nächste Token voraus.** Flüssiger Text heißt nicht, dass er wahr ist.
4. **Immer verifizieren.** Fakten, Zahlen, Quellen und Code prüfen, besonders wenn es wichtig ist.
5. **Prompt = Programm.** Klarer Kontext, Rolle, Beispiele und gewünschtes Format verbessern die Ergebnisse enorm.
6. **KI ergänzt Menschen, ersetzt Urteil nicht.** Human in the Loop bei folgenreichen Entscheidungen.
7. **Untrusted Input ist gefährlich.** Jeder Text, den ein LLM liest, kann Anweisungen enthalten (Prompt Injection).
8. **Privatsphäre beachten.** Keine Passwörter, Tokens oder sensiblen Daten in fremde KI-Dienste geben.
9. **Kosten und Grenzen kennen.** Tokens kosten Geld, Kontext ist begrenzt, Antworten variieren.
10. **Das Feld bewegt sich schnell.** Konzepte bleiben, Modelle und Tools ändern sich ständig.

## Prompting-Grundlagen
- **Rolle**: „Du bist ein erfahrener Twitch-Moderator …“
- **Kontext**: Hintergrundinfos, Zielgruppe, Regeln
- **Aufgabe**: konkret und eindeutig
- **Format**: „Antworte als JSON mit den Feldern …“
- **Beispiele (Few-Shot)**: 2–3 Eingabe/Ausgabe-Paare
- **Chain of Thought**: „Denke Schritt für Schritt“ hilft bei Logikaufgaben
- **Constraints**: Was das Modell NICHT tun soll

## Ethik & Verantwortung
- **Fairness / Bias**: Benachteiligt das System bestimmte Gruppen?
- **Transparenz**: Wissen Nutzer, dass KI beteiligt ist?
- **Erklärbarkeit**: Kann man Entscheidungen nachvollziehen?
- **Accountability**: Wer haftet bei Fehlern? (Immer ein Mensch/Unternehmen, nie „die KI“)
- **Privacy**: DSGVO, Datensparsamkeit, Einwilligung
- **Sicherheit**: Missbrauch, Deepfakes, Desinformation
- **Arbeit**: Automatisierung verändert Jobs

## Regulierung
- **EU AI Act**: risikobasierter Ansatz
  - Unannehmbares Risiko: verboten (z. B. Social Scoring)
  - Hohes Risiko: strenge Auflagen (z. B. Bewerberauswahl, kritische Infrastruktur)
  - Begrenztes Risiko: Transparenzpflichten (z. B. Chatbots, Deepfakes kennzeichnen)
  - Minimales Risiko: kaum Auflagen
- **DSGVO** gilt auch für KI-Systeme, die personenbezogene Daten verarbeiten

## KI-Sicherheit (Security)
- **Prompt Injection** (direkt und indirekt über Webseiten/Dokumente)
- **Jailbreaks**: Schutzregeln umgehen
- **Data Poisoning**: manipulierte Trainingsdaten
- **Data Leakage**: Modell gibt Trainings- oder Kontextdaten preis
- **Excessive Agency**: Agent hat zu viele Rechte. Least Privilege anwenden!
- Referenz: **OWASP Top 10 for LLM Applications**

## Glossar (Schnellübersicht)
| Begriff | Kurz |
|---|---|
| Parameter / Weights | gelernte Zahlen im Modell |
| Token | Textstück, Einheit für Ein-/Ausgabe und Kosten |
| Context Window | max. Tokens pro Anfrage |
| Inference | Modell benutzen (nicht trainieren) |
| Fine-Tuning | vortrainiertes Modell nachtrainieren |
| LoRA | effizientes Fine-Tuning mit kleinen Zusatzmatrizen |
| RAG | Dokumente suchen und in den Prompt einfügen |
| Embedding | Bedeutung als Vektor |
| Vector DB | Datenbank für Ähnlichkeitssuche über Embeddings |
| Agent | LLM, das Tools in einer Schleife nutzt |
| Hallucination | erfundene, falsche Ausgabe |
| RLHF | Feintuning durch menschliches Feedback |
| Temperature | Zufälligkeit beim Sampling |
| Quantization | Gewichte mit weniger Bits speichern |
| Open-Weight | Gewichte öffentlich herunterladbar |
| Benchmark / Eval | standardisierter Leistungstest |
