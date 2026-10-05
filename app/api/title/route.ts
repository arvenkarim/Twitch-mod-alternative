import { NextResponse } from "next/server";
import { z } from "zod";
import { decideTitleProposal } from "@/lib/moderation";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  return NextResponse.json({ proposal: decideTitleProposal(body.status) });
}
