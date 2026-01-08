/**
 * Example: Using claude-code-relay with OpenAI Node.js SDK
 */

import OpenAI from "openai";

// Point to local claude-code-relay server
const client = new OpenAI({
  baseURL: "http://localhost:52014/v1",
  apiKey: "not-needed", // API key not required for local server
});

async function main() {
  // Non-streaming example
  console.log("=== Non-streaming ===");
  const response = await client.chat.completions.create({
    model: "sonnet", // or "opus", "haiku"
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is 2 + 2?" },
    ],
  });
  console.log(response.choices[0].message.content);

  // Streaming example
  console.log("\n=== Streaming ===");
  const stream = await client.chat.completions.create({
    model: "sonnet",
    messages: [{ role: "user", content: "Write a haiku about programming." }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
  console.log();
}

main().catch(console.error);
