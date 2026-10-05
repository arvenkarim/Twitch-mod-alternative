import { NextResponse } from "next/server";
import { getDashboard } from "@/lib/moderation";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(getDashboard());
}
