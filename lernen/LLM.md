# LLM: Large Language Model

Zurück: [Lernen](Lernen.md) · Vorher: [Machine Learning](<Machine Learning.md>) · Weiter: [LLM Komponenten](<LLM Komponenten.md>)

## Definition
Ein **Large Language Model** ist ein sehr großes neuronales Netz (fast immer ein **Transformer**), das auf riesigen Textmengen trainiert wurde. Seine Grundaufgabe ist simpel:

> **Gegeben ein Text → sage das wahrscheinlichste nächste Token voraus.**

Wiederholt man das Token für Token, entsteht ganzer Text (**autoregressive Generierung**). Aus dieser simplen Aufgabe entstehen bei genug Größe Fähigkeiten wie Übersetzen, Zusammenfassen, Coden und Schlussfolgern.

„Large“ bezieht sich auf:
- **Parameter**: Milliarden bis Billionen Gewichte
- **Trainingsdaten**: Billionen Tokens (Web, Bücher, Code, …)
- **Compute**: Tausende GPUs über Wochen oder Monate

## Wie ein LLM entsteht (Trainingsphasen)
1. **Pretraining** (self-supervised)
   - Nächstes-Token-Vorhersage auf riesigen Textmengen
   - Ergebnis: **Base Model**. Kann Text fortsetzen, folgt aber noch keinen Anweisungen.
   - Der teuerste Teil.
2. **Supervised Fine-Tuning (SFT) / Instruction Tuning**
   - Training auf Beispiel-Dialogen („Frage → gute Antwort“)
   - Ergebnis: Das Modell folgt Anweisungen (Chat-Modell).
3. **Alignment / Preference Tuning**
   - **RLHF** (Reinforcement Learning from Human Feedback): Menschen bewerten Antworten, ein Reward Model lernt daraus, das LLM wird darauf optimiert.
   - Alternativen: **DPO**, **RLAIF** / Constitutional AI (KI-Feedback nach Regeln)
   - Ziel: hilfreich, ehrlich, harmlos.
4. (Optional) **Reasoning Training**: RL auf überprüfbare Aufgaben (Mathe, Code), damit das Modell erst „nachdenkt“ (Chain of Thought).

## Wie ein LLM eine Antwort erzeugt (Inference)
1. Text → **Tokenizer** → Token-IDs
2. Token-IDs → **Embeddings** (Vektoren)
3. Durch viele **Transformer-Blöcke** (Self-Attention + Feed-Forward)
4. Am Ende: Wahrscheinlichkeitsverteilung über alle Tokens (**Softmax**)
5. **Sampling** wählt ein Token (gesteuert durch Temperature, Top-p)
6. Das Token wird angehängt, dann geht es wieder bei Schritt 1 los, bis ein Stop-Token kommt.

Details: [LLM Komponenten](<LLM Komponenten.md>)

## Wie man ein LLM anpasst
| Methode | Was passiert | Wann |
|---|---|---|
| **Prompt Engineering** | Bessere Anweisungen, Beispiele (few-shot) | Immer zuerst |
| **RAG** (Retrieval-Augmented Generation) | Relevante Dokumente suchen und in den Prompt packen | Aktuelles/privates Wissen, weniger Halluzination |
| **Tool Use / Function Calling** | LLM ruft APIs auf (Suche, Rechner, DB) | Aktionen, exakte Daten |
| **Fine-Tuning** (z. B. LoRA) | Gewichte mit eigenen Daten nachtrainieren | Stil, Format, Spezialaufgaben |
| **Agents** | LLM plant mehrere Schritte und nutzt Tools in einer Schleife | Komplexe Aufgaben |

## Bekannte Modelle
- Closed: GPT (OpenAI), Claude (Anthropic), Gemini (Google)
- Open-Weight: Llama (Meta), Mistral, Qwen, DeepSeek, Gemma

## Was ein LLM NICHT ist
- Keine Datenbank: Es speichert Wissen unscharf in Gewichten und kann es falsch „erinnern“.
- Kein Mensch mit Bewusstsein oder Absichten
- Lernt nicht während des Gesprächs dazu (Gewichte bleiben fix, nur der Kontext ändert sich)
- Kennt keine aktuellen Infos nach dem **Knowledge Cutoff** (außer über Tools/RAG)
