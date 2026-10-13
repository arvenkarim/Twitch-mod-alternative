# LLM: Benefits und Drawbacks

Zurück: [Lernen](Lernen.md) · Vorher: [LLM Komponenten](<LLM Komponenten.md>) · Weiter: [Was man über KI wissen muss](<Was man über KI wissen muss.md>)

## ✅ Benefits
| Vorteil | Erklärung |
|---|---|
| **Vielseitigkeit** | Ein Modell für viele Aufgaben: schreiben, übersetzen, coden, zusammenfassen, klassifizieren |
| **Natürliche Sprache als Interface** | Man braucht keine Programmierkenntnisse, um es zu benutzen |
| **Zero-/Few-Shot Learning** | Neue Aufgaben nur über den Prompt lösen, ohne Training |
| **Kontextverständnis** | Versteht Nuancen, Ironie und Slang besser als regelbasierte Systeme (z. B. Wortfilter) |
| **Produktivität** | Beschleunigt Entwürfe, Recherche, Code, Boilerplate |
| **Skalierung & Verfügbarkeit** | 24/7, parallel, in vielen Sprachen |
| **Breites Wissen** | Riesige Menge an Allgemeinwissen aus dem Training |
| **Integrierbar** | Über APIs, mit Tools/RAG/Agents erweiterbar |
| **Personalisierung** | Ton und Format leicht anpassbar |

## ❌ Drawbacks
| Nachteil | Erklärung |
|---|---|
| **Halluzinationen** | Erfindet plausibel klingende, aber falsche Fakten oder Quellen, und klingt dabei selbstsicher |
| **Kein echtes Verständnis / Wahrheitsbegriff** | Optimiert auf wahrscheinlichen Text, nicht auf Wahrheit |
| **Knowledge Cutoff** | Kennt nichts nach dem Trainingsende (ohne Tools) |
| **Bias** | Übernimmt Vorurteile und Stereotype aus den Trainingsdaten |
| **Prompt Injection / Jailbreaks** | Eingeschleuster Text kann Anweisungen überschreiben. Untrusted Input ist gefährlich! |
| **Nicht deterministisch** | Gleiche Frage, verschiedene Antworten. Schwer zu testen. |
| **Black Box** | Entscheidungen schwer erklärbar und auditierbar |
| **Kosten & Latenz** | Rechenintensiv, Kosten pro Token, langsamer als klassische Regeln |
| **Begrenzter Kontext** | Context Window ist endlich, „lost in the middle“ bei sehr langen Texten |
| **Schwach bei exakten Aufgaben** | Rechnen, Zählen, Buchstaben (Tokenisierung), lange Logikketten |
| **Datenschutz** | Eingaben gehen evtl. an Drittanbieter, Trainingsdaten können Leaks enthalten |
| **Urheberrecht** | Trainingsdaten und Output rechtlich teils ungeklärt |
| **Umwelt** | Hoher Energie- und Wasserverbrauch beim Training und Betrieb |
| **Sycophancy** | Neigt dazu, dem Nutzer recht zu geben |
| **Missbrauch** | Spam, Desinformation, Phishing, Deepfakes in großem Maßstab |

## Gegenmaßnahmen (Mitigations)
- **RAG** + Quellenangaben gegen Halluzinationen und veraltetes Wissen
- **Tools** für exakte Aufgaben (Rechner, Code, DB)
- **Human in the Loop** bei wichtigen Entscheidungen
- **Guardrails / Policy-Layer**: Das LLM schlägt vor, deterministischer Code entscheidet
- **Structured Output** (JSON-Schema) + Validierung
- **Niedrige Temperature** für konsistente Ergebnisse
- **Evals**: systematische Tests mit Beispieldatensätzen
- **Audit Logs**: jede Entscheidung mit Modell- und Regelversion nachvollziehbar machen

## Praxisbeispiel: Nachtschicht
| LLM-Schwäche | Gegenmaßnahme im Projekt |
|---|---|
| Prompt Injection | Chat ist untrusted, `!aimod` nur vom verifizierten Broadcaster ([Chat ist untrusted](<../notes/Produkt/Chat ist untrusted.md>)) |
| Halluzination / Fehlurteil | KI liefert nur ein Urteil, `lib/policy.ts` entscheidet |
| Fehler bei wichtigen Personen | [Geschützte Rollen](<../notes/Produkt/Geschützte Rollen.md>) werden nur markiert |
| Unkontrollierte Aktionen | [Shadow und Not-Aus](<../notes/Produkt/Shadow und Not-Aus.md>), Unban nur durch Menschen ([Unban](../notes/Produkt/Unban.md)) |
| Black Box | Audit-Record mit Modell- und Regelversion |
