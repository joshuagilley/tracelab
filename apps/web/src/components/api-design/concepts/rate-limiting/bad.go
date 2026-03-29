package ratelimit

// BadPattern is what fails in production.
const BadPattern = `
Anti-patterns:

• No limiter — one abusive client ties up all workers.
• Return 500 on overload — clients retry harder (thundering herd).
• Global sleep in handler — adds latency for everyone, not a real quota.
• Same limit for free vs paid tiers — no way to monetize or protect SLAs.

Prefer 429 + clear limits headers (e.g. X-RateLimit-Remaining) when exposing public APIs.
`
