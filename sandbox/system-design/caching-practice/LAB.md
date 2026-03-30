# Lab: In-memory cache

After unzipping, work inside the **`caching-practice`** folder. Quick checks:

```bash
go test ./...
go run .
```

## Goal

Implement a tiny string cache in **`main.go`** using a map. When it works, `go test` passes and `go run .` prints a cache hit.

## Files

| File | Role |
|------|------|
| **LAB.md** | This guide |
| **go.mod** | Go module |
| **main.go** | Your code — `Cache`, `NewCache`, `Set`, `Get`, and `main` |
| **main_test.go** | Specs (read-only in TraceLab; do not edit for submission) |
| **solution.go** | Optional reference (`//go:build ignore` — not part of `go test`) |

## API to implement

- `NewCache() *Cache`
- `Set(key, value string)`
- `Get(key string) (string, bool)` — `(value, true)` on hit, `("", false)` on miss

## Run locally

```bash
cd caching-practice   # if you are not already in this directory
go test -v
go run .
```

Expected demo output when correct:

```text
hit: TraceLab
```

## Stretch

TTL, mutexes, eviction — only after the base passes tests.
