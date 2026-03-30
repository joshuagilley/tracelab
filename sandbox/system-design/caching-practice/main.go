package main

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
	// TODO: assign to c.data
}

// Get returns the value and whether the key was present.
func (c *Cache) Get(key string) (string, bool) {
	// TODO: read from c.data
	return "", false
}
