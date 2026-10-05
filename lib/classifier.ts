import type { ChannelSettings, ChatMessage, Classification, ViolationCategory } from "./types";

const HATE_TERMS = ["nazi", "gas the", "kill all", "racial slur"];
const HARASSMENT_TERMS = ["kys", "kill yourself", "dox", "swat you", "i will find you"];
const SEXUAL_TERMS = ["send nudes", "onlyfans leak", "child porn"];
const RAID_TERMS = ["follow for follow raid", "hate raid incoming"];
const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,
  /(.)\1{8,}/,
  /(\b\w+\b)(?:\s+\1){4,}/i,
];

const MODEL_VERSION = "heuristic-v1";

function includesAny(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(term));
}

function detectCategory(normalized: string): { category: ViolationCategory; matchedTerms: string[] } {
  const hateHits = includesAny(normalized, HATE_TERMS);
  if (hateHits.length > 0) {
    return { category: "hate", matchedTerms: hateHits };
  }

  const harassmentHits = includesAny(normalized, HARASSMENT_TERMS);
  if (harassmentHits.length > 0) {
    return { category: "harassment", matchedTerms: harassmentHits };
  }

  const sexualHits = includesAny(normalized, SEXUAL_TERMS);
  if (sexualHits.length > 0) {
    return { category: "sexual", matchedTerms: sexualHits };
  }

  const raidHits = includesAny(normalized, RAID_TERMS);
  if (raidHits.length > 0) {
    return { category: "raid", matchedTerms: raidHits };
  }

  const spamHits = SPAM_PATTERNS.filter((pattern) => pattern.test(normalized)).map((pattern) => pattern.source);
  if (spamHits.length > 0) {
    return { category: "spam", matchedTerms: spamHits };
  }

  if (normalized.includes("idiot") || normalized.includes("trash") || normalized.includes("suck")) {
    return { category: "toxicity", matchedTerms: ["insult"] };
  }

  return { category: "none", matchedTerms: [] };
}

export function classifyMessage(message: ChatMessage, settings: ChannelSettings): Classification {
  const normalized = message.text.toLowerCase().trim();
  const allowedHit = settings.allowedTerms.find((term) => normalized.includes(term.toLowerCase()));

  if (allowedHit) {
    return {
      category: "none",
      risk: "none",
      confidence: 0.92,
      reason: `Allowed community term "${allowedHit}" was treated as in-context chat.`,
      matchedTerms: [allowedHit],
    };
  }

  const blockedHit = settings.blockedTerms.find((term) => normalized.includes(term.toLowerCase()));
  if (blockedHit) {
    return {
      category: "spam",
      risk: "medium",
      confidence: 0.97,
      reason: `Matched a channel blocked term: ${blockedHit}.`,
      matchedTerms: [blockedHit],
    };
  }

  const detected = detectCategory(normalized);

  if (detected.category === "hate" || detected.category === "sexual") {
    return {
      category: detected.category,
      risk: "severe",
      confidence: 0.96,
      reason: "Severe policy violation that a human moderator would ban immediately.",
      matchedTerms: detected.matchedTerms,
    };
  }

  if (detected.category === "harassment" || detected.category === "raid") {
    return {
      category: detected.category,
      risk: "high",
      confidence: 0.9,
      reason: "Targeted harassment or raid language that requires a hard chat action.",
      matchedTerms: detected.matchedTerms,
    };
  }

  if (detected.category === "spam") {
    return {
      category: "spam",
      risk: "medium",
      confidence: 0.84,
      reason: "Link or repetition pattern that looks like spam.",
      matchedTerms: detected.matchedTerms,
    };
  }

  if (detected.category === "toxicity") {
    return {
      category: "toxicity",
      risk: "low",
      confidence: 0.72,
      reason: "Mild insult that should be flagged or warned, not banned.",
      matchedTerms: detected.matchedTerms,
    };
  }

  return {
    category: "none",
    risk: "none",
    confidence: 0.8,
    reason: "No policy violation detected.",
    matchedTerms: [],
  };
}

export function getModelVersion(): string {
  return MODEL_VERSION;
}
