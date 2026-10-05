import { NextResponse } from "next/server";
import { z } from "zod";
import { setChannelSettings } from "@/lib/moderation";
import { moderationLevels, operatingModes } from "@/lib/types";

export const runtime = "nodejs";

const schema = z.object({
  operatingMode: z.enum(operatingModes).optional(),
  moderationLevel: z.enum(moderationLevels).optional(),
  emergencyStop: z.boolean().optional(),
  maxTimeoutSeconds: z.number().int().min(30).max(1_209_600).optional(),
  allowMessageDeletion: z.boolean().optional(),
  allowTimeouts: z.boolean().optional(),
  allowAutomaticBans: z.boolean().optional(),
  allowChatModeChanges: z.boolean().optional(),
  allowTitleProposals: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one setting is required.");

export async function POST(request: Request) {
  try {
    const result = schema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid settings.", issues: result.error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(setChannelSettings(result.data));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}
