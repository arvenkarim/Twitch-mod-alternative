# Übungsfragen

Zurück: [Lernen](Lernen.md)

Erst selbst beantworten, dann die Lösung aufklappen.

## Multiple Choice

**1. Was ist die Grundaufgabe beim Pretraining eines LLMs?**
a) Bilder klassifizieren · b) das nächste Token vorhersagen · c) Fragen aus einer Datenbank beantworten · d) Menschen bewerten Antworten

> [!success]- Lösung
> **b)** Self-supervised Next-Token-Prediction. d) ist RLHF (später im Training).

**2. Ein Spam-Filter markiert viele harmlose Nachrichten als Spam. Was ist niedrig?**
a) Recall · b) Precision · c) Temperature · d) Context Window

> [!success]- Lösung
> **b) Precision.** Viele False Positives.

**3. Welche Komponente lässt Tokens aufeinander Bezug nehmen?**
a) Tokenizer · b) Feed-Forward · c) Self-Attention · d) Softmax

> [!success]- Lösung
> **c) Self-Attention**

**4. Ein Modell hat 99 % Trainings-Accuracy, aber 60 % Test-Accuracy. Was liegt vor?**
a) Underfitting · b) Overfitting · c) Data Drift · d) Halluzination

> [!success]- Lösung
> **b) Overfitting**

**5. Welche Methode gibt einem LLM aktuelles Firmenwissen, ohne es neu zu trainieren?**
a) RLHF · b) Pretraining · c) RAG · d) Quantization

> [!success]- Lösung
> **c) RAG**

**6. Temperature 0 bedeutet …**
a) maximal kreativ · b) nahezu deterministisch · c) Modell ist aus · d) keine Tokens

> [!success]- Lösung
> **b)** Es wird (fast) immer das wahrscheinlichste Token gewählt.

**7. Welche Lernart nutzt Belohnungen?**
a) Supervised · b) Unsupervised · c) Reinforcement · d) Self-Supervised

> [!success]- Lösung
> **c) Reinforcement Learning**

**8. Warum zählen LLMs Buchstaben oft falsch?**
a) zu wenig Parameter · b) sie sehen Tokens statt Buchstaben · c) Temperature zu hoch · d) Knowledge Cutoff

> [!success]- Lösung
> **b) Tokenisierung**

## Offene Fragen

**9. Erkläre in 3 Sätzen, was ein LLM ist.**
> [!success]- Musterlösung
> Ein LLM ist ein großes neuronales Netz mit Transformer-Architektur und Milliarden Parametern. Es wurde auf riesigen Textmengen darauf trainiert, das nächste Token vorherzusagen. Durch Fine-Tuning und RLHF folgt es Anweisungen und kann so viele Sprachaufgaben lösen.

**10. Beschreibe den Weg eines Prompts durch ein LLM.**
> [!success]- Musterlösung
> Tokenizer → Token-IDs → Embeddings + Positional Encoding → N Transformer-Blöcke (Self-Attention + Feed-Forward, mit Residual + Norm) → Output Layer (Logits) → Softmax → Sampling (Temperature/Top-p) → nächstes Token → anhängen und wiederholen bis zum Stop-Token.

**11. Nenne je 3 Benefits und Drawbacks von LLMs und zu jedem Drawback eine Gegenmaßnahme.**
> [!success]- Musterlösung
> Benefits: vielseitig, natürliche Sprache als Interface, Zero-Shot ohne Training.
> Drawbacks → Mitigation:
> - Halluzination → RAG, Quellen, Verifikation
> - Prompt Injection → Input als untrusted behandeln, Policy-Layer, Least Privilege
> - Nicht deterministisch → niedrige Temperature, Structured Output, Evals

**12. Warum sollte ein LLM in einem Moderations-Bot nicht direkt bannen dürfen?**
> [!success]- Musterlösung
> Es kann halluzinieren, durch Chatnachrichten manipuliert werden (Prompt Injection) und hat Bias. Deshalb liefert es nur ein Urteil. Deterministische Regeln entscheiden, geschützte Rollen werden nur markiert, es gibt Shadow Mode und Not-Aus, Unbans macht nur ein Mensch, und alles wird auditiert.

**13. Was ist der Unterschied zwischen Fine-Tuning und RAG? Wann nimmt man was?**
> [!success]- Musterlösung
> Fine-Tuning ändert die Gewichte. Das eignet sich für Stil, Format oder Spezialverhalten. RAG ändert nur den Prompt durch gesuchte Dokumente. Das eignet sich für aktuelles, privates oder häufig wechselndes Wissen und für Quellenangaben. Meist zuerst Prompting, dann RAG, erst dann Fine-Tuning.

**14. Erkläre Precision und Recall am Beispiel eines Twitch-Moderators.**
> [!success]- Musterlösung
> Precision: Von allen gebannten Nutzern, wie viele waren wirklich Troll/Spam? Niedrig heißt Unschuldige gebannt. Recall: Von allen echten Trollen, wie viele wurden erwischt? Niedrig heißt Spam rutscht durch. Bei harten Aktionen (Ban) ist Precision wichtiger.
