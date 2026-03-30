# TraceLab lab: Caching

## Goal

Build a tiny in-memory cache in Go.

By the end of this lab, you should be able to:

- create a cache
- store a value by key
- retrieve a value by key
- prove behavior with tests and with program output

### Example output

After you implement `Set` / `Get`, running the demo should print:

```text
hit: TraceLab
```

## Constraints

- Use **Go’s standard library only** for the base exercise.
- Put your implementation in **`cache/cache.go`** — keep **`main.go`** as a small demo runner.

## Starter API

Implement on `*Cache`:

- `New() *Cache`
- `Set(key, value string)`
- `Get(key string) (string, bool)`

Use an in-memory `map[string]string` for the first version.

## Success signal

1. `go test ./...` passes (defines expected behavior).
2. `go run .` prints `hit: TraceLab` (or `miss` until `Get` works).

## Files

| Path | Role |
|------|------|
| `main.go` | Runs the exercise; shows how the package is used |
| `cache/cache.go` | **Your implementation** |
| `cache/cache_test.go` | Specs — run `go test ./cache` |
| `lesson/notes.md` | Optional context and stretch ideas |
| `solutions/basic-cache.go` | Optional reference (separate package; not wired into `main`) |

## Run

```bash
cd caching-practice
go test ./...
go run .
```

## Stretch goals

- TTL expiration
- Concurrency safety with `sync.RWMutex`
- Size-based eviction
- LRU with `container/list`
