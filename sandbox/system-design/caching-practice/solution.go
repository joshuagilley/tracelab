//go:build ignore

package main

// Reference solution — this file is NOT compiled with `go test` or `go run`.
// Remove the build tag locally if you want to try swapping it in (rename your main.go first).

type cacheRef struct {
	data map[string]string
}

func newCacheRef() *cacheRef {
	return &cacheRef{data: make(map[string]string)}
}

func (c *cacheRef) Set(key, value string) {
	c.data[key] = value
}

func (c *cacheRef) Get(key string) (string, bool) {
	v, ok := c.data[key]
	return v, ok
}
