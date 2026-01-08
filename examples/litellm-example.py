"""Example: Using claude-code-relay with LiteLLM."""

from litellm import completion

# Non-streaming
print("=== Non-streaming ===")
response = completion(
    model="openai/sonnet",  # prefix with "openai/" to use OpenAI-compatible endpoint
    api_base="http://localhost:52014/v1",
    api_key="not-needed",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
)
print(response.choices[0].message.content)

# Streaming
print("\n=== Streaming ===")
response = completion(
    model="openai/sonnet",
    api_base="http://localhost:52014/v1",
    api_key="not-needed",
    messages=[
        {"role": "user", "content": "Write a short poem about the ocean."},
    ],
    stream=True,
)

for chunk in response:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
print()
