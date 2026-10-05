import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestChatMessage } from "@/lib/moderation";
import { channelRoles } from "@/lib/types";

export const runtime = "nodejs";

const schema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  role: z.enum(channelRoles),
  text: z.string().min(1).max(500),
  language: z.string().optional(),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const result = ingestChatMessage(body);
  return NextResponse.json(result);
}
