# Caching — context

## Why it matters

Caching shows up everywhere in backend systems:

- API response caching
- Session storage
- Rate limiting
- Memoization
- Reducing repeated database or network work

## Stretch ideas

After the base map-backed cache works:

- TTL expiration (`time`, background cleanup or lazy expiry)
- Concurrency safety (`sync.RWMutex`)
- Size-based eviction
- LRU with `container/list`

## Suggested standard library packages

You may find these useful for stretch versions:

- `sync` — concurrency safety
- `time` — TTL expiration
- `container/list` — LRU-style eviction
- `encoding/json` — structured cached values
- `net/http` — response caching patterns later

You do not need any of these for the base exercise; start with a plain map.
