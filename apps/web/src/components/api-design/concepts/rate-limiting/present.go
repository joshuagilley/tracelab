package ratelimit

// GoodMiddlewarePattern describes a production-friendly rate limit contract.
const GoodMiddlewarePattern = `
// Pseudocode: HTTP middleware with token bucket per client identity (e.g. API key or IP).

func RateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        key := clientKey(r) // API key > IP > anonymous bucket
        if !bucket.Take(key) {
            w.Header().Set("Retry-After", "2")
            http.Error(w, "rate limit exceeded", http.StatusTooManyRequests) // 429
            return
        }
        next.ServeHTTP(w, r)
    })
}

// Also document in OpenAPI: 429 + Retry-After so clients back off intentionally.
`
