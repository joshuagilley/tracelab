//go:build ignore

package main

// Reference solution — this file is NOT compiled with `go test` or `go run`.
// To try it locally: copy this file over main.go and remove the first line
// (`//go:build ignore`) so your solution is included in the build.

import "fmt"

func main() {
	c := NewCache()
	c.Set("framework", "TraceLab")

	value, ok := c.Get("framework")
	if !ok {
		fmt.Println("miss")
		return
	}

	fmt.Println("hit:", value)
}

// Cache is an in-memory string cache. Use a map for storage.
type Cache struct {
	data map[string]string
}

// NewCache returns an empty cache.
func NewCache() *Cache {
	return &Cache{
		data: make(map[string]string),
	}
}

// Set stores value under key.
func (c *Cache) Set(key, value string) {
	c.data[key] = value
}

// Get returns the value and whether the key was present.
func (c *Cache) Get(key string) (string, bool) {
	v, ok := c.data[key]
	return v, ok
}
