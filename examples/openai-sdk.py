"""Example: Using claude-code-relay with OpenAI Python SDK."""

from openai import OpenAI

# Point to local claude-code-relay server
client = OpenAI(
    base_url="http://localhost:52014/v1",
    api_key="not-needed",  # API key not required for local server
)

# Non-streaming example
print("=== Non-streaming ===")
response = client.chat.completions.create(
    model="sonnet",  # or "opus", "haiku"
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is 2 + 2?"},
    ],
)
print(response.choices[0].message.content)

# Streaming example
print("\n=== Streaming ===")
stream = client.chat.completions.create(
    model="sonnet",
    messages=[
        {"role": "user", "content": "Write a haiku about programming."},
    ],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
print()
