package caching

import (
	"encoding/json"
	"net/http"
)

// Anti-pattern: shared mutable map without synchronization, no eviction, and no TTL.
// Concurrent requests can race; memory grows without bound.
var leakyUserCache = make(map[string]any)

// GetUserLeaky shows what not to do when layering HTTP handlers over a cache.
func GetUserLeaky(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")

	if u, ok := leakyUserCache[userID]; ok {
		w.Header().Set("X-Cache", "HIT")
		_ = json.NewEncoder(w).Encode(u)
		return
	}

	u := map[string]string{"id": userID, "name": "Example User"}
	leakyUserCache[userID] = u
	_ = json.NewEncoder(w).Encode(u)
}
