import { NextResponse } from "next/server";
import { buildTwitchAuthorizeUrl, isTwitchConfigured } from "@/lib/twitch";

export const runtime = "nodejs";

export function GET() {
  if (!isTwitchConfigured()) {
    return NextResponse.json(
      { error: "Twitch credentials are missing. The dashboard still works in demo mode." },
      { status: 400 },
    );
  }

  return NextResponse.redirect(buildTwitchAuthorizeUrl(crypto.randomUUID()));
}
