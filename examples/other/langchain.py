"""Example: Using claude-code-relay with LangChain."""

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Create model pointing to local claude-code-relay server
model = ChatOpenAI(
    model="sonnet",
    openai_api_key="not-needed",
    openai_api_base="http://localhost:52014/v1",
)

# Simple invocation
print("=== Simple ===")
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is the meaning of life?"),
]
response = model.invoke(messages)
print(response.content)

# Streaming
print("\n=== Streaming ===")
for chunk in model.stream([HumanMessage(content="Tell me a joke.")]):
    print(chunk.content, end="", flush=True)
print()
