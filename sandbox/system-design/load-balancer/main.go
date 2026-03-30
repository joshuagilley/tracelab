package main

import (
	"fmt"
	"sync/atomic"
)

// LoadBalancer distributes work across backends in round-robin order (thread-safe).
// Keep counter before backends so atomic.AddUint64 on counter is 64-bit aligned (32-bit arches).
type LoadBalancer struct {
	counter  uint64
	backends []string
}

func NewLoadBalancer(backends []string) *LoadBalancer {
	return &LoadBalancer{backends: backends}
}

// Next returns the next backend id in round-robin order, e.g. A, B, C, A, B, C, …
// Use sync/atomic for counter so concurrent callers are safe.
func (lb *LoadBalancer) Next() string {
	if len(lb.backends) == 0 {
		return ""
	}
	// TODO: increment lb.counter with atomic.AddUint64(&lb.counter, 1)
	// and return lb.backends[(idx-1)%len] — see LAB.md.
	_ = atomic.LoadUint64(&lb.counter)
	return ""
}

func main() {
	lb := NewLoadBalancer([]string{"A", "B", "C"})
	for i := 0; i < 9; i++ {
		fmt.Println(lb.Next())
	}
}
