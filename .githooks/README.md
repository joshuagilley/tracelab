# Git hooks

The **`pre-commit`** hook runs the same checks as **GitHub CI** (see `.github/workflows/ci.yml`):

1. **`go test ./...`** in `services/api`
2. **`go run ./cmd/lab-tester -repo <repo root>`** in `services/api` (see `labs/concepts.json`)
3. **`npm run slopsniff`** in `apps/web` (rules in `apps/web/slopsniff.json`)
4. **`npm run build`** in `apps/web`

## Enable

**`make install`** sets `core.hooksPath` to this directory automatically (when run inside a Git clone).

To enable manually:

```bash
git config core.hooksPath "$(git rev-parse --show-toplevel)/.githooks"
```

Run from the repository root.

## Disable

```bash
git config --unset core.hooksPath
```

Hooks are plain Bash so any Git client (including Cursor’s **Commit**) uses them whenever `core.hooksPath` is set.
