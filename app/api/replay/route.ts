import { NextResponse } from "next/server";
import { openReplayDatabase, runReplay } from "@/lib/replay";

export const runtime = "nodejs";

export function POST() {
  try {
    return NextResponse.json(runReplay(openReplayDatabase()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Replay failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
