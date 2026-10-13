import { NextResponse } from "next/server";
import { z } from "zod";
import { applyChannelSettings } from "@/lib/moderation";
import { SETTINGS_LIMITS, TIMEOUT_SECONDS } from "@/lib/settings-input";
import { channelRoles, moderationLevels, operatingModes } from "@/lib/types";

export const runtime = "nodejs";

const schema = z
  .object({
    operatingMode: z.enum(operatingModes).optional(),
    moderationLevel: z.enum(moderationLevels).optional(),
    emergencyStop: z.boolean().optional(),
    maxTimeoutSeconds: z.number().int().min(TIMEOUT_SECONDS.min).max(TIMEOUT_SECONDS.max).optional(),
    allowMessageDeletion: z.boolean().optional(),
    allowTimeouts: z.boolean().optional(),
    allowAutomaticBans: z.boolean().optional(),
    allowChatModeChanges: z.boolean().optional(),
    allowTitleProposals: z.boolean().optional(),
    houseRules: z.string().max(SETTINGS_LIMITS.houseRules).optional(),
    allowedTerms: z.array(z.string().max(SETTINGS_LIMITS.termLength)).max(SETTINGS_LIMITS.terms).optional(),
    blockedTerms: z.array(z.string().max(SETTINGS_LIMITS.termLength)).max(SETTINGS_LIMITS.terms).optional(),
    protectedRoles: z.array(z.enum(channelRoles)).max(channelRoles.length).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one setting is required.");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid settings.", issues: result.error.issues }, { status: 400 });
  }

  const applied = applyChannelSettings(result.data);
  if (!applied.ok) {
    return NextResponse.json({ error: applied.error }, { status: 400 });
  }
  return NextResponse.json(applied.settings);
}
