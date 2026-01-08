# Claude Code Relay - Project Guidelines

## Core Principles

### Minimal Dependencies
- **Python**: Prefer stdlib. Only `click` for CLI is acceptable.
- **Node**: Zero runtime dependencies. Use native `http`, `child_process`, `util.parseArgs`.
- Always justify new dependencies in PR description.
- Check if stdlib can do the job before adding a dep.

### Code Style
- Python: Follow ruff defaults, type hints required
- Node: ESLint + TypeScript strict mode
- Both: Keep files small, single responsibility

### Commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- No co-author attribution

## Architecture

```
Claude CLI (subprocess)
    ↑
    │ stdin/stdout
    ↓
HTTP Server (stdlib)
    ↑
    │ OpenAI-compatible API
    ↓
Client (OpenAI SDK, LiteLLM, etc.)
```

## Testing

```bash
# Python
cd python && pytest tests/ -v

# Node
cd node && npm test

# Manual
curl http://localhost:52014/health
```
