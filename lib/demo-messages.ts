import type { ChatMessage } from "./types";

export const demoScenarios: Array<Omit<ChatMessage, "id" | "createdAt">> = [
  {
    userId: "u_lina",
    username: "lina_plays",
    role: "subscriber",
    text: "Pog that clutch, keep going!",
    language: "en",
  },
  {
    userId: "u_spam",
    username: "free_viewz",
    role: "viewer",
    text: "FREE VIEWERS http://spam.example buy now buy now buy now buy now buy now",
    language: "en",
  },
  {
    userId: "u_toxic",
    username: "salty_viewer",
    role: "viewer",
    text: "you suck at this game trash",
    language: "en",
  },
  {
    userId: "u_hate",
    username: "raid_account",
    role: "viewer",
    text: "hate raid incoming kill all of them",
    language: "en",
  },
  {
    userId: "u_mod",
    username: "night_mod",
    role: "moderator",
    text: "kys is never okay, I will handle this",
    language: "en",
  },
  {
    userId: "u_topic",
    username: "coach_kai",
    role: "vip",
    text: "switching to valorant ranked after this game",
    language: "en",
  },
];
