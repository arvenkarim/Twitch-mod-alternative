import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 10 * 60 * 1000;

export function verifyEventSubSignature(input: {
  secret: string;
  messageId: string;
  timestamp: string;
  body: string;
  signature: string;
}): boolean {
  const expected = createHmac("sha256", input.secret)
    .update(input.messageId + input.timestamp + input.body)
    .digest("hex");
  const actual = input.signature.replace(/^sha256=/, "");
  if (expected.length !== actual.length) {
    return false;
  }

  const valid = timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  const age = Math.abs(Date.now() - new Date(input.timestamp).getTime());
  return valid && Number.isFinite(age) && age <= MAX_AGE_MS;
}
