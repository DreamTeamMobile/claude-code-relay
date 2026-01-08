/**
 * HTTP server with OpenAI-compatible endpoints using native Node.js
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { ClaudeCLI, type CLIConfig } from "./cli-wrapper.js";
import { generateId } from "./utils.js";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ModelList,
} from "./types.js";

export interface AppConfig {
  cli?: Partial<CLIConfig>;
  verbose?: boolean;
}

let _verbose = false;

function log(...args: unknown[]): void {
  if (_verbose) {
    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(`[${timestamp}]`, ...args);
  }
}

let _cli: ClaudeCLI | null = null;

function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function sendError(res: ServerResponse, message: string, status = 500): void {
  sendJson(res, { error: { message, type: "server_error" } }, status);
}

function sendSSEChunk(res: ServerResponse, data: string): void {
  res.write(`data: ${data}\n\n`);
}

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  // Health check
  if (method === "GET" && url === "/health") {
    sendJson(res, { status: _cli ? "ok" : "degraded", cli_available: _cli !== null });
    return;
  }

  // List models
  if (method === "GET" && url === "/v1/models") {
    const now = Math.floor(Date.now() / 1000);
    const models: ModelList = {
      object: "list",
      data: [
        { id: "sonnet", object: "model", created: now, owned_by: "anthropic" },
        { id: "opus", object: "model", created: now, owned_by: "anthropic" },
        { id: "haiku", object: "model", created: now, owned_by: "anthropic" },
      ],
    };
    sendJson(res, models);
    return;
  }

  // Chat completions
  if (method === "POST" && url === "/v1/chat/completions") {
    if (!_cli) {
      sendError(res, "Claude CLI not available", 503);
      return;
    }

    let request: ChatCompletionRequest;
    try {
      const body = await readBody(req);
      request = JSON.parse(body);
    } catch {
      sendError(res, "Invalid JSON", 400);
      return;
    }

    const chatId = generateId("chatcmpl");
    const created = Math.floor(Date.now() / 1000);
    const msgCount = request.messages?.length ?? 0;
    const lastMsg = request.messages?.[msgCount - 1]?.content?.slice(0, 30) ?? "";
    log(`→ POST /v1/chat/completions model=${request.model} stream=${!!request.stream} msgs=${msgCount} "${lastMsg}${lastMsg.length >= 30 ? '...' : ''}"`);

    if (request.stream) {
      // Streaming response
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-Accel-Buffering": "no",
      });

      // Initial chunk
      const initial: ChatCompletionChunk = {
        id: chatId,
        object: "chat.completion.chunk",
        created,
        model: request.model,
        choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }],
      };
      sendSSEChunk(res, JSON.stringify(initial));

      let totalLen = 0;
      try {
        for await (const text of _cli.stream(request.messages, request.model)) {
          totalLen += text.length;
          const chunk: ChatCompletionChunk = {
            id: chatId,
            object: "chat.completion.chunk",
            created,
            model: request.model,
            choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
          };
          sendSSEChunk(res, JSON.stringify(chunk));
        }
        log(`← stream complete, total length=${totalLen}`);
      } catch (err) {
        log(`← stream error: ${err}`);
        sendSSEChunk(res, JSON.stringify({ error: { message: String(err), type: "server_error" } }));
      }

      // Final chunk
      const final: ChatCompletionChunk = {
        id: chatId,
        object: "chat.completion.chunk",
        created,
        model: request.model,
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      };
      sendSSEChunk(res, JSON.stringify(final));
      sendSSEChunk(res, "[DONE]");
      res.end();
      return;
    }

    // Non-streaming response
    try {
      const content = await _cli.complete(request.messages, request.model);
      log(`← response complete, length=${content.length}`);
      const response: ChatCompletionResponse = {
        id: chatId,
        object: "chat.completion",
        created,
        model: request.model,
        choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
      sendJson(res, response);
    } catch (err) {
      log(`← error: ${err}`);
      sendError(res, String(err));
    }
    return;
  }

  // Not found
  sendError(res, "Not found", 404);
}

export function createApp(config?: AppConfig) {
  _verbose = config?.verbose ?? process.env.CLAUDE_CODE_RELAY_VERBOSE === "1";

  try {
    _cli = new ClaudeCLI({ ...config?.cli, verbose: _verbose });
  } catch (err) {
    console.error(`Failed to initialize Claude CLI: ${err}`);
    _cli = null;
  }

  return createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error("Request error:", err);
      sendError(res, "Internal server error");
    });
  });
}

export function runServer(host = "127.0.0.1", port = 52014, config?: AppConfig): void {
  const server = createApp(config);
  server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}
