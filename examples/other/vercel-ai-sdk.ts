/**
 * Example: Using claude-code-relay with Vercel AI SDK
 */

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, streamText } from "ai";

// Create provider pointing to local claude-code-relay server
const claude = createOpenAICompatible({
  name: "claude-code-relay",
  baseURL: "http://localhost:52014/v1",
  apiKey: "not-needed",
});

async function main() {
  // Non-streaming example
  console.log("=== Non-streaming ===");
  const { text } = await generateText({
    model: claude.chatModel("sonnet"),
    system: "You are a helpful assistant.",
    prompt: "What is 2 + 2?",
  });
  console.log(text);

  // Streaming example
  console.log("\n=== Streaming ===");
  const result = await streamText({
    model: claude.chatModel("sonnet"),
    prompt: "Write a haiku about programming.",
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  console.log();
}

main().catch(console.error);
