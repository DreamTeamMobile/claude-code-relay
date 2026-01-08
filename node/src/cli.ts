#!/usr/bin/env node
/**
 * CLI entrypoint for claude-code-relay using native parseArgs
 */

import { parseArgs } from "node:util";
import { runServer } from "./server.js";
import { which } from "./utils.js";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    port: { type: "string", short: "p", default: process.env.CLAUDE_CODE_RELAY_PORT ?? "52014" },
    host: { type: "string", short: "h", default: process.env.CLAUDE_CODE_RELAY_HOST ?? "127.0.0.1" },
    "claude-path": { type: "string", default: process.env.CLAUDE_CLI_PATH ?? "claude" },
    timeout: { type: "string", default: process.env.CLAUDE_CODE_RELAY_TIMEOUT ?? "300" },
    verbose: { type: "boolean", short: "v", default: false },
    version: { type: "boolean", short: "V", default: false },
    help: { type: "boolean", default: false },
  },
});

const command = positionals[0];

if (values.version) {
  console.log("claude-code-relay 0.0.1");
  process.exit(0);
}

if (values.help || (!command && !values.version)) {
  console.log(`
claude-code-relay - OpenAI-compatible API server for Claude CLI

Usage:
  claude-code-relay <command> [options]

Commands:
  serve    Start the API server
  check    Check if Claude CLI is available

Options:
  -p, --port <port>         Port to listen on (default: 52014)
  -h, --host <host>         Host to bind to (default: 127.0.0.1)
      --claude-path <path>  Path to Claude CLI binary (default: claude)
      --timeout <seconds>   Request timeout in seconds (default: 300)
  -v, --verbose             Enable verbose logging
  -V, --version             Show version
      --help                Show this help
`);
  process.exit(0);
}

if (command === "serve") {
  const port = parseInt(values.port!, 10);
  const host = values.host!;
  const claudePath = values["claude-path"]!;
  const timeout = parseInt(values.timeout!, 10);
  const verbose = values.verbose!;

  // Set environment for CLI wrapper
  process.env.CLAUDE_CLI_PATH = claudePath;
  process.env.CLAUDE_CODE_RELAY_TIMEOUT = String(timeout);
  process.env.CLAUDE_CODE_RELAY_VERBOSE = verbose ? "1" : "";

  console.log("Starting Claude Code Relay server...");
  console.log(`  Host: ${host}`);
  console.log(`  Port: ${port}`);
  console.log(`  Claude CLI: ${claudePath}`);
  console.log(`  Timeout: ${timeout}s`);
  console.log();
  console.log(`API endpoint: http://${host}:${port}/v1/chat/completions`);
  console.log();

  runServer(host, port, {
    cli: { cliPath: claudePath, timeout, verbose },
  });
} else if (command === "check") {
  console.log("Checking Claude CLI...");

  const cliPath = values["claude-path"] ?? process.env.CLAUDE_CLI_PATH ?? "claude";
  const resolved = which(cliPath);

  if (resolved) {
    console.log(`  CLI path: ${resolved}`);
    console.log("  Status: OK");
  } else {
    console.error(`  Error: Claude CLI not found at '${cliPath}'`);
    process.exit(1);
  }
} else {
  console.error(`Unknown command: ${command}`);
  console.error("Run 'claude-code-relay --help' for usage");
  process.exit(1);
}
