// Runnable cache-aside demo — uses ../lru_cache.go (TraceLab Caching lesson).
//
//	go run .
//
// From repo root:
//
//	cd labs/system-design && go run ./concepts/caching/demo
package main

import (
	"fmt"
	"time"

	"tracelab.system-design/concepts/caching"
)

type user struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// Tiny stand-in for a database — same idea as handler.go in the UI code panel.
var fakeDB = map[string]user{
	"42": {ID: "42", Name: "Ada"},
	"7":  {ID: "7", Name: "Grace"},
}

func main() {
	cache := caching.NewLRUCache(128)
	const ttl = 5 * time.Minute

	// Simulate repeated GetUser-style lookups: first access misses, second hits.
	for _, id := range []string{"42", "42", "99", "7", "7"} {
		key := "user:" + id
		if v, ok := cache.Get(key); ok {
			fmt.Printf("HIT  %s → %+v\n", id, v)
			continue
		}
		u, ok := fakeDB[id]
		if !ok {
			fmt.Printf("MISS %s → not in DB\n", id)
			continue
		}
		cache.Set(key, u, ttl)
		fmt.Printf("MISS %s → loaded from DB, stored in cache\n", id)
	}
}
