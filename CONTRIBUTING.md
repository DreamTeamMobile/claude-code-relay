# Contributing to claude-code-relay

Thank you for your interest in contributing!

## Development Setup

### Python

```bash
cd python
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e ".[dev]"
```

### Node

```bash
cd node
npm install
npm run build
```

## Code Style

### Python

- We use [Ruff](https://github.com/astral-sh/ruff) for linting and formatting
- Run `ruff check src/` to lint
- Run `ruff format src/` to format
- Type hints are required; run `mypy src/` to check

### Node/TypeScript

- We use ESLint for linting
- Run `npm run lint` to lint
- Run `npm run lint:fix` to auto-fix
- Run `npm run typecheck` for type checking

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons, etc) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Other changes that don't modify src or test files |

### Scopes

| Scope | Description |
|-------|-------------|
| `python` | Python package changes |
| `node` | Node package changes |
| `deps` | Dependency updates |
| `release` | Release-related changes |

### Examples

```bash
feat(python): add support for function calling
fix(node): handle streaming timeout correctly
docs: update README with new examples
chore(deps): update fastapi to 0.110.0
```

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Run linting and tests locally
5. Commit using conventional commits
6. Open a PR with a clear description

## Testing

### Python

```bash
cd python
pytest tests/ -v
```

### Node

```bash
cd node
npm test
```

## Releasing

Releases are triggered by pushing a git tag:

```bash
# Update version in:
# - python/pyproject.toml
# - node/package.json

git add -A
git commit -m "chore(release): v0.2.0"
git tag v0.2.0
git push origin main --tags
```

This will trigger the publish workflows for both PyPI and npm.

## Questions?

Open an issue for any questions or concerns.
