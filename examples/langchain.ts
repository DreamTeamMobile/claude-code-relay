/**
 * Example: Using claude-code-relay with LangChain.js
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Create model pointing to local claude-code-relay server
const model = new ChatOpenAI({
  modelName: "sonnet",
  openAIApiKey: "not-needed",
  configuration: {
    baseURL: "http://localhost:52014/v1",
  },
});

async function main() {
  // Simple invocation
  console.log("=== Simple ===");
  const messages = [
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage("What is the meaning of life?"),
  ];
  const response = await model.invoke(messages);
  console.log(response.content);

  // Streaming
  console.log("\n=== Streaming ===");
  const stream = await model.stream([new HumanMessage("Tell me a joke.")]);
  for await (const chunk of stream) {
    process.stdout.write(String(chunk.content));
  }
  console.log();
}

main().catch(console.error);
