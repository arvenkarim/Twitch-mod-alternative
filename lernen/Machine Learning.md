# Machine Learning

Zurück: [Lernen](Lernen.md) · Vorher: [KI Grundlagen](<KI Grundlagen.md>) · Weiter: [LLM](LLM.md)

## Definition
Machine Learning heißt: Ein Algorithmus **lernt aus Daten** eine Funktion, die Eingaben auf Ausgaben abbildet, ohne dass jemand die Regeln explizit programmiert. Das Modell verbessert sich, indem es einen **Fehler (Loss)** minimiert.

## Die drei (+1) Lernarten
| Art | Daten | Beispiel |
|---|---|---|
| **Supervised Learning** | gelabelt (Eingabe + richtige Antwort) | Spam/kein Spam, Hauspreis vorhersagen |
| **Unsupervised Learning** | ohne Labels | Kunden clustern, Anomalien finden |
| **Reinforcement Learning** | Belohnung/Strafe aus einer Umgebung | Spiele, Robotik, RLHF bei LLMs |
| **Self-Supervised Learning** | Labels kommen aus den Daten selbst | LLM-Pretraining: nächstes Wort vorhersagen |

Supervised teilt sich in:
- **Classification**: Kategorie vorhersagen (z. B. toxisch ja/nein)
- **Regression**: Zahl vorhersagen (z. B. Preis)

## Der ML-Workflow
1. Problem definieren
2. Daten sammeln und bereinigen (das macht meist ~80 % der Arbeit)
3. Features wählen bzw. Daten aufbereiten
4. Daten aufteilen: **Training / Validation / Test**
5. Modell trainieren (Loss minimieren, z. B. mit Gradient Descent)
6. Evaluieren (Accuracy, Precision, Recall, F1 …)
7. Deployen und überwachen (Data Drift!)

## Wichtige Konzepte
- **Model / Parameter (Weights)**: die gelernten Zahlen im Modell
- **Hyperparameter**: Einstellungen, die man vorher festlegt (Learning Rate, Anzahl Schichten)
- **Loss Function**: misst, wie falsch das Modell liegt
- **Gradient Descent**: Parameter schrittweise in die Richtung ändern, in der der Loss sinkt
- **Backpropagation**: berechnet in neuronalen Netzen die Gradienten für alle Gewichte
- **Epoch**: ein kompletter Durchlauf durch die Trainingsdaten
- **Overfitting**: Modell lernt die Trainingsdaten auswendig und generalisiert schlecht
- **Underfitting**: Modell ist zu simpel und erkennt nicht einmal die Trainingsmuster
- **Bias-Variance Tradeoff**: Balance zwischen zu simpel (Bias) und zu stark angepasst (Variance)
- **Training vs. Inference**: Lernen (teuer, einmalig) vs. Benutzen (bei jeder Anfrage)

## Metriken (Classification)
- **Accuracy**: Anteil richtiger Vorhersagen. Bei ungleich verteilten Klassen irreführend!
- **Precision**: Von allem, was als positiv markiert wurde, wie viel war wirklich positiv? (wenige False Positives)
- **Recall**: Von allen echten Positiven, wie viele wurden gefunden? (wenige False Negatives)
- **F1**: harmonisches Mittel aus Precision und Recall
- Beispiel Moderation: hohe Precision heißt wenige unschuldige Bans, hoher Recall heißt wenig Spam rutscht durch.

## Typische Algorithmen
- Linear / Logistic Regression
- Decision Trees, Random Forest, Gradient Boosting (XGBoost)
- k-Nearest Neighbors, k-Means (Clustering)
- Support Vector Machines
- Neuronale Netze: CNN (Bilder), RNN/LSTM (Sequenzen, alt), **Transformer** (heute Standard)

## ✅ Benefits von ML
- Automatisiert Aufgaben, für die man kaum Regeln schreiben kann (Bilder, Sprache)
- Skaliert auf riesige Datenmengen
- Findet Muster, die Menschen übersehen
- Passt sich an, wenn neue Daten kommen (Retraining)
- Konsistent, ermüdet nicht, rund um die Uhr verfügbar

## ❌ Drawbacks von ML
- **Braucht viele, gute Daten**: garbage in, garbage out
- **Bias**: übernimmt Vorurteile aus den Trainingsdaten
- **Black Box**: schwer zu erklären, *warum* entschieden wurde (Explainability)
- **Overfitting** und schlechte Generalisierung auf neue Situationen
- **Data Drift**: die Welt ändert sich, das Modell veraltet
- Teuer: Rechenleistung, Labeling, Expertise
- Korrelation ≠ Kausalität
- Angreifbar (Adversarial Examples, Data Poisoning)
