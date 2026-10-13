# Karteikarten

Zurück: [Lernen](Lernen.md)

Format: Frage, dann `?`, dann Antwort. In Cursor die Antwort unter dem `?` abdecken und selbst abfragen.

---

## Grundlagen

Was ist der Unterschied zwischen AI, ML, Deep Learning und LLM?
?
Verschachtelt: AI ist der Oberbegriff. ML ist AI, die aus Daten lernt. Deep Learning ist ML mit tiefen neuronalen Netzen. LLMs sind Deep-Learning-Modelle (Transformer) für Sprache.

Was ist der Kernunterschied zwischen klassischer Programmierung und ML?
?
Klassisch: Mensch schreibt Regeln (Regeln + Daten → Ergebnis). ML: Maschine lernt Regeln aus Beispielen (Daten + Ergebnisse → Modell).

Was ist Narrow AI vs. AGI?
?
Narrow AI löst bestimmte Aufgaben (alles, was es heute gibt). AGI wäre allgemeine Intelligenz auf menschlichem Niveau über alle Aufgaben hinweg und existiert nicht.

Welches Paper hat 2017 den Transformer eingeführt?
?
„Attention Is All You Need“ (Google, 2017).

Was ist Generative AI?
?
KI, die neue Inhalte erzeugt (Text, Bilder, Audio, Code), statt nur zu klassifizieren oder vorherzusagen.

Was ist ein Foundation Model?
?
Ein großes, auf breiten Daten vortrainiertes Modell, das für viele verschiedene Aufgaben angepasst werden kann.

## Machine Learning

Was ist Supervised Learning?
?
Lernen mit gelabelten Daten (Eingabe + richtige Antwort). Beispiel: Spam-Klassifikation.

Was ist Unsupervised Learning?
?
Lernen ohne Labels, das Modell findet selbst Strukturen. Beispiel: Kunden-Clustering.

Was ist Reinforcement Learning?
?
Ein Agent lernt durch Belohnung und Strafe aus Interaktion mit einer Umgebung. Beispiel: Spiele, RLHF.

Was ist Self-Supervised Learning?
?
Die Labels werden aus den Daten selbst erzeugt, z. B. „sage das nächste Wort vorher“. Grundlage des LLM-Pretrainings.

Classification vs. Regression?
?
Classification sagt eine Kategorie vorher (toxisch ja/nein), Regression eine Zahl (Preis).

Was ist Overfitting?
?
Das Modell lernt die Trainingsdaten auswendig (inkl. Rauschen) und generalisiert schlecht auf neue Daten. Gut im Training, schlecht im Test.

Was ist Underfitting?
?
Das Modell ist zu einfach und erkennt nicht einmal die Muster in den Trainingsdaten.

Was ist eine Loss Function?
?
Eine Funktion, die misst, wie falsch die Vorhersagen sind. Training = Loss minimieren.

Was macht Gradient Descent?
?
Passt die Parameter schrittweise in die Richtung an, in der der Loss am stärksten sinkt. Die Schrittgröße ist die Learning Rate.

Was ist Backpropagation?
?
Algorithmus, der in neuronalen Netzen die Gradienten für alle Gewichte berechnet, rückwärts von der Ausgabe zur Eingabe.

Parameter vs. Hyperparameter?
?
Parameter (Weights) werden gelernt. Hyperparameter legt man vorher fest (Learning Rate, Anzahl Schichten, Batch Size).

Warum teilt man Daten in Training / Validation / Test?
?
Training zum Lernen, Validation zum Tunen der Hyperparameter, Test zur ehrlichen Endbewertung auf ungesehenen Daten.

Precision vs. Recall?
?
Precision: Wie viele der als positiv markierten sind wirklich positiv (wenig False Positives)? Recall: Wie viele aller echten Positiven wurden gefunden (wenig False Negatives)?

Warum ist Accuracy bei unausgeglichenen Klassen irreführend?
?
Wenn 99 % der Nachrichten harmlos sind, erreicht ein Modell, das immer „harmlos“ sagt, 99 % Accuracy, findet aber keinen einzigen Spam.

Was ist Data Drift?
?
Die realen Daten verändern sich mit der Zeit (z. B. neuer Slang), das Modell wird schlechter. Lösung: Monitoring und Retraining.

Nenne 4 Benefits von ML.
?
Automatisiert schwer regelbare Aufgaben, skaliert auf große Datenmengen, findet versteckte Muster, ist konsistent und rund um die Uhr verfügbar.

Nenne 4 Drawbacks von ML.
?
Braucht viele gute Daten, übernimmt Bias, Black Box (schwer erklärbar), Overfitting/Data Drift, teuer.

## LLM

Was ist ein LLM in einem Satz?
?
Ein sehr großes Transformer-Netz, trainiert auf riesigen Textmengen, das das nächste Token vorhersagt.

Was bedeutet „autoregressiv“?
?
Das Modell erzeugt Token für Token, jedes neue Token wird an die Eingabe angehängt und dient als Basis für das nächste.

Was sind die Trainingsphasen eines LLMs?
?
1) Pretraining (nächstes Token, riesige Daten → Base Model) 2) Supervised Fine-Tuning / Instruction Tuning 3) Alignment (RLHF/DPO) 4) optional Reasoning-RL.

Was ist ein Base Model?
?
Das Modell nach dem Pretraining: kann Text fortsetzen, folgt aber noch nicht zuverlässig Anweisungen.

Was ist RLHF?
?
Reinforcement Learning from Human Feedback: Menschen bewerten Antworten, ein Reward Model lernt daraus, das LLM wird darauf optimiert (hilfreich, harmlos, ehrlich).

Was ist der Knowledge Cutoff?
?
Das Datum, bis zu dem Trainingsdaten vorliegen. Neueres Wissen fehlt, außer es kommt über Tools/RAG.

Training vs. Inference?
?
Training passt die Gewichte an (teuer, einmalig). Inference bedeutet, das fertige Modell zu benutzen (bei jeder Anfrage).

Lernt ein LLM während eines Gesprächs dazu?
?
Nein. Die Gewichte bleiben fix, nur der Kontext (Chatverlauf) im Context Window ändert sich.

Was ist RAG?
?
Retrieval-Augmented Generation: relevante Dokumente suchen (meist über Embeddings) und in den Prompt einfügen. Ergebnis: aktuelleres Wissen und weniger Halluzinationen.

Was ist Fine-Tuning und was ist LoRA?
?
Fine-Tuning trainiert ein vortrainiertes Modell mit eigenen Daten nach. LoRA ist eine effiziente Variante, die nur kleine Zusatzmatrizen trainiert.

Was ist ein AI Agent?
?
Ein LLM, das in einer Schleife plant, Tools aufruft (APIs, Suche, Code), Ergebnisse auswertet und mehrere Schritte selbstständig ausführt.

Was ist Zero-Shot vs. Few-Shot?
?
Zero-Shot: Aufgabe ohne Beispiele lösen. Few-Shot: ein paar Beispiele im Prompt mitgeben.

## LLM Komponenten

Was macht der Tokenizer?
?
Zerlegt Text in Tokens (Wortteile) und wandelt sie in IDs um. Verfahren z. B. BPE.

Warum kann ein LLM schlecht Buchstaben zählen?
?
Es sieht Tokens (Wortteile), nicht einzelne Buchstaben.

Faustregel: Wie viel Text ist ein Token?
?
Englisch ca. 4 Zeichen bzw. ¾ Wort. Deutsch braucht meist mehr Tokens.

Was ist ein Embedding?
?
Ein Vektor (Liste von Zahlen), der die Bedeutung eines Tokens/Textes darstellt. Ähnliche Bedeutung ergibt ähnliche Vektoren.

Wozu braucht man Positional Encoding?
?
Attention kennt von sich aus keine Reihenfolge. Positional Encoding (z. B. RoPE) fügt die Position der Tokens hinzu.

Was macht Self-Attention?
?
Jedes Token gewichtet, wie relevant die anderen Tokens für es sind, und mischt deren Informationen. So entstehen Bezüge (z. B. „es“ → „Tier“).

Was sind Query, Key und Value?
?
Query = wonach ein Token sucht, Key = was ein Token anbietet, Value = der Inhalt. Score = Q·K, Softmax, gewichtete Summe der Values.

Wie lautet die Attention-Formel?
?
Attention(Q,K,V) = softmax(Q·Kᵀ / √d) · V

Was ist Multi-Head Attention?
?
Mehrere Attention-Berechnungen parallel, jeder Kopf lernt andere Beziehungen (Syntax, Bezüge, Themen).

Was ist die Causal Mask?
?
Sorgt bei Decoder-Modellen dafür, dass ein Token nur auf vorherige Tokens schaut, nicht in die Zukunft.

Warum sind lange Kontexte teuer?
?
Self-Attention wächst quadratisch mit der Anzahl Tokens (jedes Token mit jedem).

Was macht das Feed-Forward Network im Transformer-Block?
?
Verarbeitet jedes Token einzeln mit einem kleinen MLP. Enthält viele Parameter und vermutlich viel gespeichertes Wissen.

Was ist Mixture of Experts (MoE)?
?
Statt eines FFN gibt es mehrere Experten, ein Router wählt pro Token wenige aus. Viele Parameter, aber pro Token wenig Rechenaufwand.

Wozu Residual Connections und LayerNorm?
?
Residual (x + f(x)) hält tiefe Netze trainierbar. LayerNorm/RMSNorm stabilisiert die Werte.

Was passiert im Output Layer?
?
Der letzte Vektor wird zu Logits (eine Zahl pro Token im Vocabulary), Softmax macht daraus Wahrscheinlichkeiten.

Was bewirkt die Temperature?
?
Niedrig (≈0): deterministisch, fokussiert. Hoch (>1): zufälliger, kreativer, fehleranfälliger.

Was ist Top-p (Nucleus) Sampling?
?
Es werden nur die wahrscheinlichsten Tokens zugelassen, bis ihre Summe p (z. B. 0.9) erreicht, daraus wird gesampelt.

Was ist das Context Window?
?
Die maximale Anzahl an Tokens (Eingabe + Ausgabe), die das Modell auf einmal verarbeiten kann.

Was ist der KV-Cache?
?
Zwischenspeicher für Keys/Values bereits verarbeiteter Tokens, damit die Generierung nicht alles neu berechnen muss.

Was ist Quantization?
?
Gewichte mit weniger Bits speichern (z. B. 4-bit statt 16-bit). Kleiner und schneller, leichter Qualitätsverlust.

Decoder-only vs. Encoder-only?
?
Decoder-only (GPT, Claude, Llama) generiert Text. Encoder-only (BERT) versteht und klassifiziert, z. B. für Embeddings.

## Benefits & Drawbacks von LLMs

Nenne 5 Benefits von LLMs.
?
Vielseitig (ein Modell, viele Aufgaben), natürliche Sprache als Interface, Zero-/Few-Shot ohne Training, versteht Kontext und Nuancen, skalierbar und 24/7 verfügbar.

Nenne 5 Drawbacks von LLMs.
?
Halluzinationen, Bias, Prompt Injection, nicht deterministisch, Black Box, Kosten/Latenz, Knowledge Cutoff, Datenschutz.

Was ist eine Halluzination?
?
Plausibel klingende, aber falsche oder erfundene Ausgabe (Fakten, Quellen, Code-APIs), oft mit hoher Selbstsicherheit.

Warum halluzinieren LLMs?
?
Sie optimieren auf wahrscheinlichen Text, nicht auf Wahrheit, und haben keinen eingebauten Faktencheck.

Was ist Prompt Injection?
?
Eingeschleuster Text (z. B. in einer Chatnachricht oder Webseite) enthält Anweisungen, die das LLM befolgt und die eigentlichen Regeln überschreiben.

Was ist Sycophancy?
?
Die Neigung des Modells, dem Nutzer nach dem Mund zu reden statt zu widersprechen.

Nenne 4 Mitigations gegen LLM-Schwächen.
?
RAG + Quellen, Tools für exakte Aufgaben, Human in the Loop, Guardrails/Policy-Layer, Structured Output + Validierung, Evals, Audit Logs.

Warum entscheidet in Nachtschicht nicht direkt das LLM über Bans?
?
Wegen Halluzinationen und Prompt Injection: Das LLM liefert nur ein Urteil, deterministischer Code (`lib/policy.ts`) entscheidet. Dazu kommen Shadow Mode, geschützte Rollen und Unban nur durch Menschen.

## KI allgemein

Was ist „Human in the Loop“?
?
Ein Mensch prüft oder bestätigt KI-Entscheidungen, besonders bei folgenreichen Aktionen.

Was regelt der EU AI Act?
?
Risikobasierte Regulierung: verbotene Praktiken (Social Scoring), Hochrisiko mit strengen Auflagen, Transparenzpflichten (Chatbots/Deepfakes kennzeichnen), minimales Risiko.

Was ist Excessive Agency?
?
Ein KI-Agent hat mehr Rechte als nötig. Gegenmittel: Least Privilege, Bestätigung durch Menschen.

Was ist Data Poisoning?
?
Manipulation der Trainingsdaten, um das Modell gezielt falsches Verhalten lernen zu lassen.

Wer haftet für Fehler einer KI?
?
Immer Menschen bzw. Organisationen (Entwickler, Betreiber), niemals „die KI“ selbst.

Open-Weight vs. Closed Model?
?
Open-Weight: Gewichte herunterladbar und lokal nutzbar (Llama, Mistral). Closed: nur per API (GPT, Claude, Gemini).
