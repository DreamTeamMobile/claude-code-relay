#!/usr/bin/env python3
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("OPENAI_BASE_URL"),
    api_key=os.environ.get("OPENAI_API_KEY", "dummy-key"),
)
model = os.environ.get("OPENAI_MODEL", "gpt-4")

def simple_chat():
    print("=== Simple Chat ===\n")
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Say hello in 3 different languages"}],
    )
    print(response.choices[0].message.content)
    print("\n")

def streaming_chat():
    print("=== Streaming Chat ===\n")
    stream = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Count from 1 to 5 slowly"}],
        stream=True,
    )
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)
    print("\n")

print(f"Base URL: {os.environ.get('OPENAI_BASE_URL', 'default')}")
print(f"Model: {model}\n")
simple_chat()
streaming_chat()
