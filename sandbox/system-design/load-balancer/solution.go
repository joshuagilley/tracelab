//go:build ignore

package main

// Reference solution — this file is NOT compiled when you run `go test ./...`.
// Tests build main.go + main_test.go only. To verify: copy the LoadBalancer type
// and Next() body into main.go (do not copy the //go:build ignore line or this file’s
// package comment into main.go).
//
// counter is placed before backends so atomic.AddUint64 is 64-bit aligned on 32-bit arches.

import (
	"fmt"
	"sync/atomic"
)

type LoadBalancer struct {
	counter  uint64
	backends []string
}

func NewLoadBalancer(backends []string) *LoadBalancer {
	return &LoadBalancer{backends: backends}
}

func (lb *LoadBalancer) Next() string {
	if len(lb.backends) == 0 {
		return ""
	}
	idx := atomic.AddUint64(&lb.counter, 1)
	return lb.backends[(idx-1)%uint64(len(lb.backends))]
}

func main() {
	lb := NewLoadBalancer([]string{"A", "B", "C"})
	for i := 0; i < 9; i++ {
		fmt.Println(lb.Next())
	}
}
