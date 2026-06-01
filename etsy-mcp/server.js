/**
 * Etsy MCP Server
 *
 * Supports two transport modes selected by the TRANSPORT env var:
 *   stdio (default) — use with Claude Desktop or `claude` CLI
 *   http            — use with Claude Code on the Web (deploy to Railway/Render/Fly)
 *
 * Usage:
 *   cp .env.example .env      # fill in your keys
 *   npm run auth              # get OAuth tokens (first time only)
 *   npm start                 # runs in stdio mode by default
 *   TRANSPORT=http npm start  # runs HTTP server on PORT (default 3001)
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { EtsyClient } from './etsy-client.js';
import { TOOL_LIST, callTool } from './tools.js';

// ── Build the MCP Server ─────────────────────────────────────────────────────

function buildServer(client) {
  const server = new Server(
    { name: 'etsy-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_LIST }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    try {
      const result = await callTool(client, name, args);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
    }
  });

  return server;
}

// ── Transport: stdio ─────────────────────────────────────────────────────────

async function runStdio() {
  const client = new EtsyClient();
  const server = buildServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[etsy-mcp] Running in stdio mode');
}

// ── Transport: HTTP / SSE ────────────────────────────────────────────────────

async function runHttp() {
  const client = new EtsyClient();
  const app = express();
  const PORT = process.env.PORT || 3001;
  const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN || '';

  // Optional bearer-token auth guard
  function authGuard(req, res, next) {
    if (!AUTH_TOKEN) return next();
    const header = req.headers['authorization'] || '';
    if (header === `Bearer ${AUTH_TOKEN}`) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok', server: 'etsy-mcp' }));

  // SSE endpoint — one connection = one MCP session
  const transports = new Map();

  app.get('/sse', authGuard, async (req, res) => {
    const transport = new SSEServerTransport('/message', res);
    const server = buildServer(client);
    transports.set(transport.sessionId, transport);
    res.on('close', () => transports.delete(transport.sessionId));
    await server.connect(transport);
  });

  app.post('/message', authGuard, express.json(), async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports.get(sessionId);
    if (!transport) return res.status(404).json({ error: 'Session not found' });
    await transport.handlePostMessage(req, res);
  });

  app.listen(PORT, () => {
    console.log(`[etsy-mcp] HTTP/SSE server running on port ${PORT}`);
    console.log(`  SSE endpoint:  http://localhost:${PORT}/sse`);
    console.log(`  Health check:  http://localhost:${PORT}/health`);
  });
}

// ── Entry point ──────────────────────────────────────────────────────────────

const mode = (process.env.TRANSPORT || 'stdio').toLowerCase();

if (mode === 'http') {
  runHttp().catch((err) => { console.error(err); process.exit(1); });
} else {
  runStdio().catch((err) => { console.error(err); process.exit(1); });
}
