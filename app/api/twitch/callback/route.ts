import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    message: "Twitch OAuth callback is reserved. The local MVP uses demo execution until credentials are added.",
  });
}
