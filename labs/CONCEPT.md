# Adding and iterating on lab concepts

TraceLab serves **design-pattern** and **data-science** concepts from the Go API as JSON; **source shown in the UI** is maintained as real files under `labs/<lab>/concepts/` you can edit, run, and test locally. This document describes layout and workflow.

## Repository layout

| Location | Purpose |
|----------|---------|
| `labs/<lab>/sandbox/` | **Scratch space** — throwaway packages, tests, spikes, and notes. Nothing here is embedded or served. |
| `labs/system-design/concepts/<slug>/` | **System design** — runnable Go that matches lessons (e.g. caching LRU + `demo/main.go`). Not embedded in the API yet; keep in sync with the UI code panel if both exist. |
| `labs/design-patterns/concepts/<slug>/present.go` | **Canonical Go** for design-pattern lessons — synced into the API embed tree. |
| `labs/data-science/concepts/<slug>/present.py` | **Canonical Python** for data-science lessons — same embed pattern as Go (e.g. `numerical-computing/present.py`, `bad.py`, `demo/main.py`, `notes.md`). |
| `labs/.../concepts/<slug>/bad.*` (optional) | **Contrast / anti-pattern** — listed as a second `codeFiles` embed for side-by-side UI toggles where supported. |
| `services/api/internal/labs/embed/design-patterns/` | **Synced copy** — `make labs-sync` copies `labs/design-patterns/concepts/` here. **Commit** so clones work without extra steps. |
| `services/api/internal/labs/embed/data-science/` | **Synced copy** — `make labs-sync` copies `labs/data-science/concepts/` here. **Commit** alongside `labs/`. |
| `services/api/internal/labs/data/design-patterns.json` | **Metadata** — `codeFiles` use `"embed": "<slug>/present.go"` (no inline `code`). |
| `services/api/internal/labs/data/data-science.json` | **Metadata** — parameters + `codeFiles` with `"embed": "<slug>/present.py"` etc. (no inline `code`). |

## End-to-end workflow

1. **Create a concept folder**
   - Design patterns: `labs/design-patterns/concepts/<slug>/present.go`, optional `bad.go`, `demo/main.go`.
   - Data science: `labs/data-science/concepts/<slug>/present.py`, optional `bad.py`, `demo/main.py`, `notes.md`.

2. **Register the concept** in the matching JSON under `services/api/internal/labs/data/`:
   - Each `codeFile` uses `"embed": "<slug>/filename"` relative to that lab’s embed root.
   - Wire the **frontend** if needed: new `vizType` values in `ConceptDetailPage` / visualizers.

3. **Sync and verify locally**:
   ```bash
   make labs-sync
   cd services/api && go test ./internal/labs/... && go run ./cmd/server
   ```
   Or use `make api` / `make dev` (they run `labs-sync` first).

4. **Docker / CI**: `docker build -f services/api/Dockerfile .` copies both `labs/design-patterns/concepts/` and `labs/data-science/concepts/` into the embed paths.

5. **Before you merge**: run `make labs-sync` and commit `labs/**/concepts/` **and** `services/api/internal/labs/embed/design-patterns/` **and** `services/api/internal/labs/embed/data-science/` so they stay identical.

## Rules of thumb

- **`present.*`** should be short, readable, and aligned with the visualization — not a full production module.
- **Sandbox** is for noise: benchmarks, alternate designs, failing tests. Promote only what you want learners to read into `present.*`.
- **Embeddable paths** are relative to `embed/<lab>/` in the API, e.g. `singleton/present.go`, `numerical-computing/present.py`. No `..` or absolute paths.
- Extend `codeFiles` with more entries and files under `concepts/<slug>/` as needed.

## Quick reference commands

```bash
# After editing labs/design-patterns/concepts/** or labs/data-science/concepts/**
make labs-sync

# Full monorepo build (runs labs-sync)
make build

# API Docker image (from repo root)
docker build -f services/api/Dockerfile -t tracelab-api .
```
