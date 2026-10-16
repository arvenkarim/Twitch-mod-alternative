import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it } from "vitest";
import { closeDatabase, getSettings, openDatabase, runWithDatabase } from "./db";
import {
  createMcpServer,
  getMcpToken,
  handleMcpRequest,
  isAllowedMcpOrigin,
  isAuthorizedMcpRequest,
  MCP_TOOL_NAMES,
} from "./mcp";
import { ingestChatMessage } from "./moderation";

const TOKEN = "t".repeat(40);
const opened: Database.Database[] = [];
const directories: string[] = [];

function tempDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nachtschicht-mcp-"));
  directories.push(directory);
  const database = openDatabase(path.join(directory, "mcp.sqlite"));
  opened.push(database);
  return database;
}

afterEach(() => {
  while (opened.length > 0) {
    const database = opened.pop();
    if (database) {
      closeDatabase(database);
    }
  }
  while (directories.length > 0) {
    const directory = directories.pop();
    if (directory) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});

async function connectClient() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createMcpServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { client, server };
}

function parseText(result: unknown) {
  const content = (result as { content: Array<{ type: string; text: string }> }).content;
  return JSON.parse(content[0].text);
}

describe("mcp access", () => {
  it("stays disabled without a long enough token", () => {
    expect(getMcpToken({})).toBeNull();
    expect(getMcpToken({ MCP_API_TOKEN: "short" })).toBeNull();
    expect(getMcpToken({ MCP_API_TOKEN: ` ${TOKEN} ` })).toBe(TOKEN);
  });

  it("accepts only the exact bearer token", () => {
    expect(isAuthorizedMcpRequest(`Bearer ${TOKEN}`, TOKEN)).toBe(true);
    expect(isAuthorizedMcpRequest(`bearer ${TOKEN}`, TOKEN)).toBe(true);
    expect(isAuthorizedMcpRequest(null, TOKEN)).toBe(false);
    expect(isAuthorizedMcpRequest(TOKEN, TOKEN)).toBe(false);
    expect(isAuthorizedMcpRequest(`Bearer ${TOKEN}x`, TOKEN)).toBe(false);
  });

  it("rejects cross-origin browser requests", () => {
    expect(isAllowedMcpOrigin(null, "http://localhost:3000/api/mcp")).toBe(true);
    expect(isAllowedMcpOrigin("http://localhost:3000", "http://localhost:3000/api/mcp")).toBe(true);
    expect(isAllowedMcpOrigin("https://evil.example", "http://localhost:3000/api/mcp")).toBe(false);
    expect(isAllowedMcpOrigin("not a url", "http://localhost:3000/api/mcp")).toBe(false);
  });
});

describe("mcp tools", () => {
  it("exposes only read-only tools", async () => {
    const { client, server } = await connectClient();
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([...MCP_TOOL_NAMES].sort());
    for (const tool of tools) {
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    }
    await client.close();
    await server.close();
  });

  it("reads the desk without changing settings or executing actions", async () => {
    const database = tempDatabase();
    await runWithDatabase(database, async () => {
      ingestChatMessage({ userId: "u1", username: "spammer", role: "viewer", text: "FREE FOLLOWERS at spam.example" });
      const before = getSettings();
      const { client, server } = await connectClient();

      const status = parseText(await client.callTool({ name: "get_channel_status", arguments: {} }));
      expect(status.settings).toMatchObject({ operatingMode: "shadow" });
      expect(JSON.stringify(status)).not.toMatch(/(access|refresh)_?token/i);

      const audit = parseText(await client.callTool({ name: "list_audit", arguments: { limit: 5 } }));
      expect(audit.untrustedFields).toEqual(["text"]);
      expect(audit.audit).toHaveLength(1);
      expect(audit.audit[0]).toMatchObject({ username: "spammer", executed: false });

      const executedOnly = parseText(
        await client.callTool({ name: "list_audit", arguments: { executed: true } }),
      );
      expect(executedOnly.audit).toHaveLength(0);

      const messages = parseText(await client.callTool({ name: "list_recent_messages", arguments: {} }));
      expect(messages.messages).toHaveLength(1);

      const invalid = await client.callTool({ name: "list_audit", arguments: { limit: 1000 } });
      expect(invalid.isError).toBe(true);

      expect(getSettings()).toEqual(before);
      await client.close();
      await server.close();
    });
  });

  it("answers stateless JSON-RPC over HTTP", async () => {
    const response = await handleMcpRequest(
      new Request("http://localhost:3000/api/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
        }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.result.serverInfo.name).toBe("nachtschicht");
  });
});
