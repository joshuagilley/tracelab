# Lab: Round-robin load balancing

Work inside the **`load-balancer`** folder after unzipping.

## Goal

Implement **`LoadBalancer.Next()`** so traffic is assigned **round-robin** across backends, **thread-safe**, using **`sync/atomic`** on the counter.

When it works, **`go test ./...`** passes and **`go run .`** prints nine lines: `A`, `B`, `C` three times each.

## Files

| File | Role |
|------|------|
| **LAB.md** | This guide |
| **go.mod** | Go module |
| **main.go** | Your code — implement **`Next()`** |
| **main_test.go** | Specs (TraceLab uses the canonical copy from Mongo for submit) |
| **solution.go** | Working reference (`//go:build ignore` — **not compiled** with `go test`; only **main.go** is) |
| **present.go** | Full **HTTP** demo: reverse proxy + two backends (`go run present.go`) |
| **bad.go** | Anti-pattern: always picks the first backend (`go run bad.go`) |

## Hints

- First call to **`Next()`** should return **`backends[0]`**, then `[1]`, `[2]`, wrap with modulo length.
- Use **`atomic.AddUint64(&lb.counter, 1)`** and derive the index from **`(idx - 1) % len(backends)`** (same pattern as **`present.go`**’s `nextBackend`).
- Empty **`backends`**: return **`""`**.

## Commands

After you paste the **`Next()`** implementation from **`solution.go`** into **`main.go`** (and fix **`NewLoadBalancer`** field order to match if needed), **`go test ./...`** should pass. Do not put **`//go:build ignore`** on **`main.go`**.

```bash
go test ./...
go run .
go run present.go   # optional: see HTTP load balancer
go run bad.go       # optional: smell the anti-pattern
```

## Stretch

Weighted round-robin, least connections, or health-aware skipping — after the base tests pass.
