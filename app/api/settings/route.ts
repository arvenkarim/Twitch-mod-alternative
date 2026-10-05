import { NextResponse } from "next/server";
import { z } from "zod";
import { setOperatingMode } from "@/lib/moderation";
import { operatingModes } from "@/lib/types";

export const runtime = "nodejs";

const schema = z.object({
  operatingMode: z.enum(operatingModes),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  return NextResponse.json(setOperatingMode(body.operatingMode));
}
