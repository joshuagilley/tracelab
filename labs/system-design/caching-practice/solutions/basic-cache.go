// Package solutions holds an optional reference implementation.
// This file is not part of the build; copy ideas into cache/cache.go if stuck.
//
// Reference: minimal map-backed cache (base lab only).
package solutions

type Cache struct {
	data map[string]string
}

func New() *Cache {
	return &Cache{data: make(map[string]string)}
}

func (c *Cache) Set(key, value string) {
	c.data[key] = value
}

func (c *Cache) Get(key string) (string, bool) {
	v, ok := c.data[key]
	return v, ok
}
