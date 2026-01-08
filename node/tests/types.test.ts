/**
 * Tests for types (compile-time validation)
 */

import { describe, it, expect } from "vitest";
import type {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "../src/types.js";

describe("types", () => {
  it("should create valid ChatMessage", () => {
    const message: ChatMessage = {
      role: "user",
      content: "Hello",
    };
    expect(message.role).toBe("user");
    expect(message.content).toBe("Hello");
  });

  it("should create valid ChatCompletionRequest", () => {
    const request: ChatCompletionRequest = {
      model: "sonnet",
      messages: [{ role: "user", content: "Hello" }],
    };
    expect(request.model).toBe("sonnet");
    expect(request.messages).toHaveLength(1);
  });

  it("should create valid ChatCompletionResponse", () => {
    const response: ChatCompletionResponse = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Date.now(),
      model: "sonnet",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "Hi!" },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };
    expect(response.object).toBe("chat.completion");
    expect(response.choices[0].message.content).toBe("Hi!");
  });
});
