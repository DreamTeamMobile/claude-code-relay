# Setup Guide

## Prerequisites

- Claude CLI installed and authenticated
- Python 3.10+ or Node.js 18+

## GitHub Repository Settings

### 1. Create Environments

Go to **Settings > Environments** and create:

#### `pypi` environment
- Used for PyPI publishing
- Add secret: `PYPI_API_TOKEN`

#### `npm` environment
- Used for npm publishing
- Add secret: `NPM_TOKEN`

### 2. Add Repository Secrets

Go to **Settings > Secrets and variables > Actions** and add:

| Secret | Where to get it |
|--------|-----------------|
| `PYPI_API_TOKEN` | [PyPI Account Settings](https://pypi.org/manage/account/token/) → Add API token |
| `NPM_TOKEN` | [npm Access Tokens](https://www.npmjs.com/settings/~/tokens) → Generate New Token (Automation) |

### 3. Enable GitHub Actions

Go to **Settings > Actions > General**:
- Allow all actions
- Workflow permissions: Read and write

## Publishing Workflow

### First Release

1. Update versions:
   ```bash
   # python/pyproject.toml
   version = "0.1.0"

   # node/package.json
   "version": "0.1.0"
   ```

2. Commit and tag:
   ```bash
   git add -A
   git commit -m "chore(release): v0.1.0"
   git tag v0.1.0
   git push origin main --tags
   ```

3. GitHub Actions will:
   - Build Python package
   - Publish to PyPI
   - Build Node package
   - Publish to npm

### Package Name Availability

Before first publish, verify package names are available:

- **PyPI**: https://pypi.org/project/claude-code-relay/ (should show 404)
- **npm**: https://www.npmjs.com/package/claude-code-relay (should show 404)

If taken, update `name` in both:
- `python/pyproject.toml`
- `node/package.json`

## Local Development

### Python

```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Run server
claude-code-relay serve

# Run tests
pytest tests/ -v
```

### Node

```bash
cd node
npm install
npm run build

# Run server
npm start

# Run tests
npm test
```

## Testing the Server

```bash
# Start server
claude-code-relay serve --port 52014

# Test with curl
curl http://localhost:52014/health

curl http://localhost:52014/v1/models

curl -X POST http://localhost:52014/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonnet",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Troubleshooting

### "Claude CLI not found"

Set the path explicitly:
```bash
export CLAUDE_CLI_PATH=/path/to/claude
claude-code-relay serve
```

Or via flag:
```bash
claude-code-relay serve --claude-path /path/to/claude
```

### PyPI Publishing Fails

1. Check `PYPI_API_TOKEN` is set correctly
2. Ensure package name is available
3. Check token has "Upload" scope

### npm Publishing Fails

1. Check `NPM_TOKEN` is set correctly
2. Ensure package name is available
3. Token must be "Automation" type (not "Read-only")
