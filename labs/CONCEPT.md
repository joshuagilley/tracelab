# Adding and iterating on lab concepts

TraceLab serves **design-pattern concepts** from the Go API as JSON, but the **Go source shown in the UI** is maintained as real files you can edit, run, and test locally. This document describes the layout and the path from experiment to “published” lesson.

## Repository layout

| Location | Purpose |
|----------|---------|
| `labs/<lab>/sandbox/` | **Scratch space** — throwaway `main` packages, tests, spikes, and notes. Nothing here is embedded or served. |
| `labs/<lab>/concepts/<slug>/present.go` | **Canonical presentation source** — the code learners see in the code panel (and what ships in the API after sync / Docker). |
| `labs/.../concepts/<slug>/bad.go` (optional) | **Contrast / anti-pattern** — e.g. `//go:build ignore` so it is not compiled with `present.go`; listed as a second `codeFiles` embed for side-by-side UI toggles. |
| `services/api/internal/labs/embed/design-patterns/` | **Synced copy** — Go’s `embed` must live under `services/api`; `make labs-sync` copies `labs/design-patterns/concepts/` here so `go run` / `go test` work locally. **Commit this tree** so clones and editors work without extra steps; it should always match `labs/` after you finish editing. |
| `services/api/internal/labs/data/design-patterns.json` | **Metadata** — title, summary, slug, `vizType`, tags, and **references** to presentation files (`embed` paths), not huge inline code strings for Go. |

**Data Science** (`data-science` lab): lesson snippets and parameters still live in `services/api/internal/labs/data/data-science.json` (Python/markdown inline). The same sandbox idea applies under `labs/data-science/sandbox/` if you want a scratch area; wiring `present.py` through embed can follow the same pattern later.

## End-to-end workflow

1. **Create a concept folder** (example for design patterns):
   - `labs/design-patterns/concepts/<slug>/present.go` — valid Go package (name it for teaching; it does not need to be `import`ed by the API).
   - Use `labs/design-patterns/sandbox/` for experiments (e.g. a small `main` that imports your draft API).

2. **Register the concept** in `services/api/internal/labs/data/design-patterns.json`:
   - Add an object with `id`, `title`, `slug`, `summary`, `difficulty`, `tags`, `status`, `labKind`, `vizType`, and `codeFiles`.
   - For Go, use a **file entry** with `"embed": "<slug>/present.go"` and **omit** inline `"code"` (the server reads the file at startup and fills `code` for the client).
   - Wire the **frontend** if needed: new `vizType` values are handled in `ConceptDetailPage` / visualizers.

3. **Sync and verify locally**:
   ```bash
   make labs-sync
   cd services/api && go test ./internal/labs/... && go run ./cmd/server
   ```
   Or use `make api` / `make dev` (they run `labs-sync` first).

4. **Docker / CI**: the API image is built from the **repository root** (`docker build -f services/api/Dockerfile .`). The Dockerfile copies `labs/design-patterns/concepts/` into the embed path, so the image always reflects the `labs/` tree.

5. **Before you merge**: run `make labs-sync` and commit both `labs/design-patterns/concepts/` and `services/api/internal/labs/embed/design-patterns/` so they stay identical.

## Rules of thumb

- **`present.go`** should be short, readable, and aligned with the visualization — not a full production module.
- **Sandbox** is for noise: benchmarks, alternate designs, failing tests. Promote only what you want learners to read into `present.go`.
- **Embeddable paths** are relative to `embed/design-patterns/` in the API, e.g. `singleton/present.go`. No `..` or absolute paths.
- If you add **multiple files** later, extend `codeFiles` with additional entries and add more files under `concepts/<slug>/` (the store already supports multiple `CodeFile` rows; each can have its own `embed` path).

## Quick reference commands

```bash
# After editing any labs/design-patterns/concepts/**/present.go
make labs-sync

# Full monorepo build (runs labs-sync)
make build

# API Docker image (from repo root)
docker build -f services/api/Dockerfile -t tracelab-api .
```
