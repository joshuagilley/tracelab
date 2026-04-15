# Sandbox (local practice arena)

This folder is a **developer sandbox**: runnable snippets and toy projects while you work on curriculum or explore concepts. The same idea as a “playground” or “scratch” tree—**the shipped app does not import or serve anything from here.**

- **Not** a dependency of the API, Vite build, or Mongo sync.
- Safe to delete, rewrite, or grow without affecting production behavior.

**CI:** `make test` and GitHub Actions run **`go run ./cmd/lab-tester`** from `services/api` (see **`Makefile`** / **`.github/workflows/ci.yml`**). The tool reads **`labs/concepts.json`**: for each listed bundle it applies the **`referenceFile`** over the **`starterFile`**, runs **`testCommand`** from the bundle directory (see **`labs/README.md`**), then restores the starter. Register new practice concepts there—there is no filename scan of `sandbox/`.

Python pins and lesson sources for the Data Science / numerical UI live under **`apps/web/src/components/data-science/…`**, not here.

### Contents

| Path | Notes |
|------|--------|
| `design-patterns/dependency-injection`, `singleton` | Go demos; canonical lesson sources stay under `apps/web/src/components/design-patterns/`. |
| `system-design/caching-practice/` | Minimal practice bundle: `go.mod`, `LAB.md`, `main.go`, `main_test.go`, `solution.go` (`//go:build ignore`). |
| `system-design/load-balancer/` | Round-robin LB lab: `present.go` / `bad.go` as `//go:build ignore` references; ship **`practice`** via Mongo / GCS tooling (see **`docs/MONGO.md`**). |
| `system-design/concepts/caching/lru_cache.go` | Heavier LRU sample for local runs. |
| `low-level-systems/pointers/` | C `present` / `bad` samples for the pointers lesson. |
