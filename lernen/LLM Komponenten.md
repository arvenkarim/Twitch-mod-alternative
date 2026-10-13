# LLM Komponenten

Zurück: [Lernen](Lernen.md) · Vorher: [LLM](LLM.md) · Weiter: [LLM Vor- und Nachteile](<LLM Vor- und Nachteile.md>)

## Überblick: Der Weg durch das Modell
```
"Hallo Welt"
   │
   ▼
[1] Tokenizer            → [15496, 2159]
   ▼
[2] Token Embeddings     → Vektor pro Token (z. B. 4096 Zahlen)
   + [3] Positional Encoding (wo steht das Token?)
   ▼
┌─────────── Transformer-Block (×N, z. B. 32–100+) ───────────┐
│ [4] Self-Attention (Multi-Head)  → Tokens schauen sich an    │
│ [5] Feed-Forward Network (MLP)   → Wissen/Verarbeitung       │
│ [6] Residual Connections + Layer Normalization               │
└──────────────────────────────────────────────────────────────┘
   ▼
[7] Output Layer (Linear + Softmax) → Wahrscheinlichkeit für jedes Token
   ▼
[8] Sampling / Decoding  → nächstes Token wählen
```

## Die Komponenten im Detail

### 1. Tokenizer
- Zerlegt Text in **Tokens** (Wortteile), z. B. „Moderation“ → „Moder“ + „ation“
- Verfahren: **BPE** (Byte Pair Encoding), SentencePiece, WordPiece
- Faustregel Englisch: 1 Token ≈ 4 Zeichen ≈ ¾ Wort. Deutsch braucht oft mehr Tokens.
- Erklärt Schwächen: Buchstaben zählen („Wie viele r in Strawberry?“) ist schwer, weil das Modell keine einzelnen Buchstaben sieht.
- **Vocabulary**: alle bekannten Tokens (typisch 32k–200k)

### 2. Embeddings
- Jede Token-ID wird zu einem **Vektor** (Liste von Zahlen)
- Ähnliche Bedeutung ergibt ähnliche Vektoren (semantischer Raum)
- Klassisches Beispiel: König − Mann + Frau ≈ Königin
- Separate **Embedding-Modelle** werden auch für Suche/RAG genutzt

### 3. Positional Encoding
- Attention selbst kennt keine Reihenfolge, also wird die Position eingebaut
- Varianten: sinusförmig (Original-Paper), gelernt, **RoPE** (Rotary, heute verbreitet)

### 4. Self-Attention (das Herzstück)
- Jedes Token „schaut“ auf alle vorherigen Tokens und entscheidet, welche relevant sind
- Beispiel: „Das Tier überquerte die Straße nicht, weil **es** zu müde war“. Attention verknüpft „es“ mit „Tier“.
- Mechanik: Jedes Token bildet **Query (Q)**, **Key (K)**, **Value (V)**
  - Score = Q · K (passt das zusammen?) → Softmax → gewichtete Summe der V
  - Formel: `Attention(Q,K,V) = softmax(QKᵀ / √d) · V`
- **Multi-Head**: mehrere Attention-Köpfe parallel, jeder lernt andere Beziehungen (Grammatik, Bezüge, …)
- **Causal Mask**: Bei GPT-artigen Modellen darf ein Token nur nach links schauen (nicht in die Zukunft)
- Kosten wachsen **quadratisch** mit der Kontextlänge, deshalb sind lange Kontexte teuer
- **KV-Cache**: speichert K/V bereits verarbeiteter Tokens, damit die Generierung schneller geht

### 5. Feed-Forward Network (MLP)
- Pro Token ein kleines neuronales Netz (zwei Linear-Schichten + Aktivierung wie GELU/SwiGLU)
- Hier steckt ein großer Teil der Parameter und vermutlich viel „Faktenwissen“
- **Mixture of Experts (MoE)**: mehrere FFN-„Experten“, ein Router wählt pro Token wenige aus. Viele Parameter, aber pro Token wenig Rechenaufwand.

### 6. Residual Connections & Layer Normalization
- **Residual**: Eingabe wird zur Ausgabe addiert (`x + f(x)`), damit tiefe Netze trainierbar bleiben
- **LayerNorm / RMSNorm**: hält die Zahlen in stabilen Bereichen

### 7. Output Layer + Softmax
- Letzter Vektor → **Logits** (eine Zahl pro Token im Vocabulary)
- **Softmax** macht daraus Wahrscheinlichkeiten, die sich zu 1 summieren

### 8. Decoding / Sampling
| Parameter | Wirkung |
|---|---|
| **Temperature** | niedrig (0–0.3): deterministisch, fokussiert · hoch (>1): kreativ, chaotisch |
| **Top-k** | nur die k wahrscheinlichsten Tokens zulassen |
| **Top-p (Nucleus)** | nur Tokens, deren Summe ≥ p (z. B. 0.9) ist |
| **Greedy** | immer das wahrscheinlichste Token |
| **Max Tokens / Stop Sequences** | Länge begrenzen, Ende festlegen |

## Architektur-Typen
| Typ | Beispiel | Gut für |
|---|---|---|
| **Decoder-only** | GPT, Claude, Llama | Textgenerierung (heutige LLMs) |
| **Encoder-only** | BERT | Verstehen, Klassifikation, Embeddings |
| **Encoder-Decoder** | T5, Original-Transformer | Übersetzung, Zusammenfassung |

## Komponenten auf System-Ebene (rund ums Modell)
- **Context Window**: wie viele Tokens das Modell auf einmal sieht (Prompt + Antwort), z. B. 128k–1M+
- **System Prompt**: Grundanweisungen vom Entwickler
- **User / Assistant Messages**: der Chatverlauf
- **Weights / Checkpoint**: die gespeicherten Parameter
- **Quantization**: Gewichte mit weniger Bits speichern (z. B. 4-bit), damit das Modell kleiner und schneller läuft, bei leichtem Qualitätsverlust
- **RAG-Pipeline**: Embedding-Modell + Vektor-Datenbank + Retriever
- **Tools / Function Calling**: strukturierte Ausgabe (JSON), die Code ausführt
- **Guardrails**: Filter und Regeln vor bzw. nach dem Modell (bei [Nachtschicht](../notes/Nachtschicht.md): `lib/policy.ts`)
