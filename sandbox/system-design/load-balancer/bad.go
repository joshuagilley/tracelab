//go:build ignore

package main

// Anti-pattern: looks like round-robin (increments a counter) but always routes to the first backend.
// Compare with solution.go and present.go. Not compiled with `go test`.
// Run: go run bad.go

import (
	"fmt"
	"sync/atomic"
)

type BrokenLoadBalancer struct {
	backends []string
	counter  uint64
}

func NewBrokenLoadBalancer(backends []string) *BrokenLoadBalancer {
	return &BrokenLoadBalancer{backends: backends}
}

func (lb *BrokenLoadBalancer) Next() string {
	if len(lb.backends) == 0 {
		return ""
	}
	_ = atomic.AddUint64(&lb.counter, 1) // misleading: we never use idx for selection
	return lb.backends[0]
}

func main() {
	lb := NewBrokenLoadBalancer([]string{"A", "B", "C"})
	for i := 0; i < 6; i++ {
		fmt.Println(lb.Next()) // always prints A
	}
}
