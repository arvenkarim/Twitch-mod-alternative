import type { StreamMetadata, TitleProposal } from "./types";

const CATEGORY_HINTS: Array<{ pattern: RegExp; category: string; title: string; tags: string[] }> = [
  {
    pattern: /\b(valorant|aim|clutch|spike)\b/i,
    category: "VALORANT",
    title: "Ranked Valorant — clutch or throw",
    tags: ["ranked", "fps", "chill"],
  },
  {
    pattern: /\b(just chatting|irl|talk|q&a)\b/i,
    category: "Just Chatting",
    title: "Just Chatting — questions, chaos, coffee",
    tags: ["irl", "qna", "german"],
  },
  {
    pattern: /\b(minecraft|survival|build)\b/i,
    category: "Minecraft",
    title: "Minecraft survival — one more night",
    tags: ["survival", "building"],
  },
];

export function proposeStreamUpdate(stream: StreamMetadata, hint: string): TitleProposal | null {
  const match = CATEGORY_HINTS.find((entry) => entry.pattern.test(hint) || entry.pattern.test(stream.title));
  if (!match) {
    return null;
  }

  const alreadyCurrent =
    stream.category.toLowerCase() === match.category.toLowerCase() &&
    stream.title.toLowerCase() === match.title.toLowerCase();

  if (alreadyCurrent) {
    return null;
  }

  return {
    title: match.title,
    category: match.category,
    tags: match.tags,
    reason: `Detected a topic shift toward ${match.category}. Waiting for broadcaster approval before publishing.`,
  };
}
