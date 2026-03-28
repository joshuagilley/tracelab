# System design lab (authoring)

Runnable Go that matches the **Caching** lesson in the app (LRU + TTL, cache-aside flow).

- **LRU implementation:** `concepts/caching/lru_cache.go`
- **Demo:** `concepts/caching/demo/main.go` — fake DB + hit/miss prints

```bash
cd labs/system-design
go run ./concepts/caching/demo
```

See **`../CONCEPT.md`** for how this relates to API-embedded labs (design-patterns today; system-design stays source-of-truth here until wired like labs).
