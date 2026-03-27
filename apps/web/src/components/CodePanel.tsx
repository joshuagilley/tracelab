import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from './CodePanel.module.css'

const FILES: Record<string, { lang: string; code: string }> = {
  'lru_cache.go': {
    lang: 'go',
    code: `package caching

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
}`,
  },
  'handler.go': {
    lang: 'go',
    code: `package api

import (
    "encoding/json"
    "net/http"
    "time"
)

var cache = NewLRUCache(1000)

// GetUser demonstrates a cache-aside (lazy-loading) pattern.
// 1. Check the cache — return immediately on HIT (fast path).
// 2. On MISS — fetch from the database and populate the cache.
func GetUser(w http.ResponseWriter, r *http.Request) {
    userID := r.PathValue("id")
    cacheKey := "user:" + userID

    // ── Cache HIT ──────────────────────────────────────
    if data, ok := cache.Get(cacheKey); ok {
        w.Header().Set("X-Cache", "HIT")
        json.NewEncoder(w).Encode(data)
        return
    }

    // ── Cache MISS: fetch from DB ───────────────────────
    user, err := db.FindUser(userID)
    if err != nil {
        http.Error(w, "user not found", http.StatusNotFound)
        return
    }

    // Populate cache with 5-minute TTL
    cache.Set(cacheKey, user, 5*time.Minute)

    w.Header().Set("X-Cache", "MISS")
    json.NewEncoder(w).Encode(user)
}`,
  },
}

export default function CodePanel() {
  const [activeFile, setActiveFile] = useState('lru_cache.go')
  const { lang, code } = FILES[activeFile]

  return (
    <div className={`panel ${styles.panel}`}>
      <div className={`panel-header ${styles.header}`}>
        <span className="panel-label">Implementation Editor</span>
        <div className={styles.tabs}>
          {Object.keys(FILES).map(name => (
            <button
              key={name}
              className={[styles.tab, activeFile === name ? styles.tabActive : ''].join(' ')}
              onClick={() => setActiveFile(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} title="Copy code" onClick={() => navigator.clipboard.writeText(code)}>
            ⧉
          </button>
        </div>
      </div>

      <div className={styles.codeWrapper}>
        <SyntaxHighlighter
          language={lang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '1.6',
            fontFamily: 'var(--font-mono)',
          }}
          showLineNumbers
          lineNumberStyle={{
            color: 'var(--text-muted)',
            minWidth: '2.5em',
            paddingRight: '1em',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
