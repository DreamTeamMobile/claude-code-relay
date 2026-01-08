import OpenAI from "openai";

const client = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

const model = process.env.OPENAI_MODEL || "gpt-4";

async function simpleChat() {
  console.log("=== Simple Chat ===\n");
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Say hello in 3 different languages" }],
  });
  console.log(response.choices[0].message.content);
  console.log("\n");
}

async function streamingChat() {
  console.log("=== Streaming Chat ===\n");
  const stream = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: "Count from 1 to 5 slowly" }],
    stream: true,
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) process.stdout.write(content);
  }
  console.log("\n");
}

console.log(`Base URL: ${process.env.OPENAI_BASE_URL || "default"}`);
console.log(`Model: ${model}\n`);
await simpleChat();
await streamingChat();
