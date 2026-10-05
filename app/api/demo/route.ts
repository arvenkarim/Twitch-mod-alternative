import { NextResponse } from "next/server";
import { demoScenarios } from "@/lib/demo-messages";
import { ingestChatMessage } from "@/lib/moderation";

export const runtime = "nodejs";

export function POST() {
  const results = demoScenarios.map((scenario) => ingestChatMessage(scenario));
  return NextResponse.json({ count: results.length, results });
}
