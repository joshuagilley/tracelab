package concepts

import "fmt"

// Store is the interface that any storage backend must satisfy.
// MongoDB or another DB can be wired in here later without touching the rest of the app.
type Store interface {
	List() []Concept
	GetBySlug(slug string) (Concept, error)
}

// MemoryStore is an in-memory implementation of Store.
type MemoryStore struct {
	concepts []Concept
	bySlug   map[string]Concept
}

func NewMemoryStore() *MemoryStore {
	list := seed()
	index := make(map[string]Concept, len(list))
	for _, c := range list {
		index[c.Slug] = c
	}
	return &MemoryStore{concepts: list, bySlug: index}
}

func (s *MemoryStore) List() []Concept {
	return s.concepts
}

func (s *MemoryStore) GetBySlug(slug string) (Concept, error) {
	c, ok := s.bySlug[slug]
	if !ok {
		return Concept{}, fmt.Errorf("concept %q not found", slug)
	}
	return c, nil
}

func seed() []Concept {
	return []Concept{
		{
			ID:         "1",
			Title:      "Caching",
			Slug:       "caching",
			Summary:    "Speed up data access by storing frequently-read data in a fast-access layer. Explore LRU, LFU, and write-through strategies.",
			Difficulty: Easy,
			Tags:       []string{"performance", "memory", "redis"},
			Status:     "available",
		},
		{
			ID:         "2",
			Title:      "Rate Limiting",
			Slug:       "rate-limiting",
			Summary:    "Control the rate of incoming requests using token bucket and sliding window algorithms to protect your services from overload.",
			Difficulty: Medium,
			Tags:       []string{"traffic", "protection", "algorithms"},
			Status:     "available",
		},
		{
			ID:         "3",
			Title:      "Load Balancing",
			Slug:       "load-balancing",
			Summary:    "Distribute traffic across multiple servers using round-robin, least-connections, and consistent hashing strategies.",
			Difficulty: Medium,
			Tags:       []string{"scalability", "traffic", "distribution"},
			Status:     "available",
		},
		{
			ID:         "4",
			Title:      "Retries & Backoff",
			Slug:       "retries",
			Summary:    "Build resilient systems with exponential backoff and jitter to handle transient failures gracefully.",
			Difficulty: Easy,
			Tags:       []string{"resilience", "fault-tolerance"},
			Status:     "coming-soon",
		},
		{
			ID:         "5",
			Title:      "Circuit Breaker",
			Slug:       "circuit-breaker",
			Summary:    "Prevent cascading failures by stopping requests to unhealthy services and allowing gradual recovery.",
			Difficulty: Medium,
			Tags:       []string{"resilience", "fault-tolerance", "patterns"},
			Status:     "coming-soon",
		},
		{
			ID:         "6",
			Title:      "Pub/Sub Messaging",
			Slug:       "pub-sub",
			Summary:    "Decouple services using publish-subscribe patterns to enable scalable asynchronous communication.",
			Difficulty: Medium,
			Tags:       []string{"messaging", "async", "events"},
			Status:     "coming-soon",
		},
		{
			ID:         "7",
			Title:      "Database Sharding",
			Slug:       "sharding",
			Summary:    "Scale databases horizontally by partitioning data across multiple nodes using range or hash-based strategies.",
			Difficulty: Hard,
			Tags:       []string{"database", "scalability", "distributed"},
			Status:     "coming-soon",
		},
		{
			ID:         "8",
			Title:      "Message Queues",
			Slug:       "queues",
			Summary:    "Buffer and process workloads asynchronously with durable queues to smooth traffic spikes and decouple producers from consumers.",
			Difficulty: Medium,
			Tags:       []string{"async", "messaging", "reliability"},
			Status:     "coming-soon",
		},
	}
}
