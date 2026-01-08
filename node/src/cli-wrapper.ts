/**
 * Wrapper for Claude CLI subprocess calls
 */

import { spawn } from "node:child_process";
import { which } from "./utils.js";
import type { ChatMessage } from "./types.js";

export interface CLIConfig {
  cliPath: string;
  timeout: number;
  verbose: boolean;
}

const MODEL_MAP: Record<string, string> = {
  sonnet: "sonnet",
  opus: "opus",
  haiku: "haiku",
  "claude-3-sonnet": "sonnet",
  "claude-3-opus": "opus",
  "claude-3-haiku": "haiku",
  "claude-sonnet-4": "sonnet",
  "claude-opus-4": "opus",
};

export class ClaudeCLI {
  private config: CLIConfig;

  constructor(config?: Partial<CLIConfig>) {
    this.config = {
      cliPath: config?.cliPath ?? process.env.CLAUDE_CLI_PATH ?? "claude",
      timeout: config?.timeout ?? parseInt(process.env.CLAUDE_CODE_RELAY_TIMEOUT ?? "300", 10),
      verbose: config?.verbose ?? process.env.CLAUDE_CODE_RELAY_VERBOSE === "1",
    };

    this.validateCLI();
  }

  private validateCLI(): void {
    const cliPath = which(this.config.cliPath);
    if (!cliPath) {
      throw new Error(
        `Claude CLI not found at '${this.config.cliPath}'. ` +
          "Please install it or set CLAUDE_CLI_PATH."
      );
    }
    if (this.config.verbose) {
      console.log(`Using Claude CLI at: ${cliPath}`);
    }
  }

  private normalizeModel(model: string): string {
    return MODEL_MAP[model.toLowerCase()] ?? "sonnet";
  }

  private buildPrompt(messages: ChatMessage[], systemPrompt?: string): string {
    const parts: string[] = [];

    // Extract system prompt from messages if not provided
    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
        break;
      }
    }

    if (systemPrompt) {
      parts.push(`System: ${systemPrompt}\n`);
    }

    for (const msg of messages) {
      if (msg.role === "system") continue;
      if (msg.role === "user") {
        parts.push(`Human: ${msg.content}\n`);
      } else if (msg.role === "assistant") {
        parts.push(`Assistant: ${msg.content}\n`);
      }
    }

    parts.push("Assistant:");
    return parts.join("\n");
  }

  async complete(
    messages: ChatMessage[],
    model = "sonnet",
    systemPrompt?: string
  ): Promise<string> {
    const prompt = this.buildPrompt(messages, systemPrompt);
    const normalizedModel = this.normalizeModel(model);

    return new Promise((resolve, reject) => {
      const args = ["-p", "--model", normalizedModel, "--output-format", "text"];

      if (this.config.verbose) {
        console.log(`Running: ${this.config.cliPath} ${args.join(" ")}`);
      }

      const proc = spawn(this.config.cliPath, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Claude CLI failed: ${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });

      proc.on("error", (err) => {
        reject(err);
      });

      // Send prompt and close stdin
      proc.stdin.write(prompt);
      proc.stdin.end();

      // Timeout
      setTimeout(() => {
        proc.kill();
        reject(new Error(`Claude CLI timeout after ${this.config.timeout}s`));
      }, this.config.timeout * 1000);
    });
  }

  async *stream(
    messages: ChatMessage[],
    model = "sonnet",
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    const prompt = this.buildPrompt(messages, systemPrompt);
    const normalizedModel = this.normalizeModel(model);

    const args = ["-p", "--model", normalizedModel, "--output-format", "stream-json"];

    if (this.config.verbose) {
      console.log(`Running: ${this.config.cliPath} ${args.join(" ")}`);
    }

    const proc = spawn(this.config.cliPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Send prompt
    proc.stdin.write(prompt);
    proc.stdin.end();

    let buffer = "";

    for await (const chunk of proc.stdout) {
      buffer += chunk.toString();

      // Process complete lines
      while (buffer.includes("\n")) {
        const [line, rest] = buffer.split("\n", 2);
        buffer = rest ?? "";

        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const data = JSON.parse(trimmed);
          if (data.content) {
            yield data.content;
          } else if (data.text) {
            yield data.text;
          } else if (data.delta?.text) {
            yield data.delta.text;
          }
        } catch {
          // Not JSON, might be raw text
          if (!trimmed.startsWith("{")) {
            yield trimmed;
          }
        }
      }
    }
  }
}
