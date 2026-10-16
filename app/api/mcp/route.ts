import { NextResponse } from "next/server";
import { getMcpToken, handleMcpRequest, isAllowedMcpOrigin, isAuthorizedMcpRequest, MCP_TOKEN_MIN_LENGTH } from "@/lib/mcp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = getMcpToken();
  if (!token) {
    return NextResponse.json(
      { error: `MCP server is disabled. Set MCP_API_TOKEN to at least ${MCP_TOKEN_MIN_LENGTH} characters.` },
      { status: 503 },
    );
  }
  if (!isAllowedMcpOrigin(request.headers.get("origin"), request.url)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  if (!isAuthorizedMcpRequest(request.headers.get("authorization"), token)) {
    return NextResponse.json(
      { error: "Missing or invalid bearer token." },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
    );
  }
  try {
    return await handleMcpRequest(request);
  } catch {
    return NextResponse.json({ error: "MCP request failed." }, { status: 400 });
  }
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: "This MCP server is stateless. Send JSON-RPC requests with POST." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;
