// Package caching holds a small thread-safe LRU cache with per-entry TTL.
// This mirrors the TraceLab system-design Caching lesson (see demo/main.go).
package caching

import (
	"container/list"
	"sync"
	"time"
)

// LRUCache is a thread-safe Least Recently Used cache.
// When capacity is reached, the least-recently-used entry is evicted.
type LRUCache struct {
	capacity  int
	mu        sync.Mutex
	evictList *list.List
	items     map[string]*list.Element
}

type entry struct {
	key   string
	value any
	expAt time.Time
}

// NewLRUCache creates an empty cache with the given max entry count.
func NewLRUCache(capacity int) *LRUCache {
	return &LRUCache{
		capacity:  capacity,
		evictList: list.New(),
		items:     make(map[string]*list.Element),
	}
}

// Get retrieves a value. Returns (value, true) on cache HIT.
// On cache MISS, the entry is evicted and (nil, false) is returned.
func (c *LRUCache) Get(key string) (any, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	el, ok := c.items[key]
	if !ok {
		return nil, false // cache MISS — key not present
	}

	ent := el.Value.(*entry)
	if time.Now().After(ent.expAt) {
		c.removeElement(el)
		return nil, false // cache MISS — TTL expired
	}

	c.evictList.MoveToFront(el) // mark as recently used
	return ent.value, true      // cache HIT
}

// Set inserts or updates a key with the given TTL.
// If the cache is full, the least-recently-used entry is evicted first.
func (c *LRUCache) Set(key string, value any, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if el, ok := c.items[key]; ok {
		c.evictList.MoveToFront(el)
		ent := el.Value.(*entry)
		ent.value = value
		ent.expAt = time.Now().Add(ttl)
		return
	}

	if c.evictList.Len() >= c.capacity {
		c.evictOldest()
	}

	ent := &entry{key: key, value: value, expAt: time.Now().Add(ttl)}
	el := c.evictList.PushFront(ent)
	c.items[key] = el
}

func (c *LRUCache) evictOldest() {
	el := c.evictList.Back()
	if el != nil {
		c.removeElement(el)
	}
}

func (c *LRUCache) removeElement(el *list.Element) {
	c.evictList.Remove(el)
	delete(c.items, el.Value.(*entry).key)
}
