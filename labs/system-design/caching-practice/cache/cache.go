package cache

// Cache is an in-memory string cache. Implement storage using a map.
type Cache struct {
	data map[string]string
}

// New returns an empty cache ready for use.
func New() *Cache {
	return &Cache{
		data: make(map[string]string),
	}
}

// Set stores value under key.
func (c *Cache) Set(key, value string) {
	// TODO: store key → value in c.data
}

// Get returns the value for key and whether it was present.
func (c *Cache) Get(key string) (string, bool) {
	// TODO: read from c.data
	return "", false
}
