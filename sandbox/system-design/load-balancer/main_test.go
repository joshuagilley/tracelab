package main

import "testing"

func TestRoundRobinThree(t *testing.T) {
	lb := NewLoadBalancer([]string{"A", "B", "C"})
	for round := 0; round < 3; round++ {
		for _, want := range []string{"A", "B", "C"} {
			if g := lb.Next(); g != want {
				t.Fatalf("want %q got %q", want, g)
			}
		}
	}
}

func TestRoundRobinTwo(t *testing.T) {
	lb := NewLoadBalancer([]string{"east", "west"})
	for i := 0; i < 8; i++ {
		want := []string{"east", "west"}[i%2]
		if g := lb.Next(); g != want {
			t.Fatalf("i=%d want %q got %q", i, want, g)
		}
	}
}

func TestSingleBackend(t *testing.T) {
	lb := NewLoadBalancer([]string{"only"})
	for i := 0; i < 10; i++ {
		if g := lb.Next(); g != "only" {
			t.Fatalf("i=%d want only got %q", i, g)
		}
	}
}
