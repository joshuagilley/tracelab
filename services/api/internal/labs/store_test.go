package labs

import (
	"strings"
	"testing"
)

func TestHydrateDesignPatternsSingleton(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("design-patterns", "singleton")
	if err != nil {
		t.Fatal(err)
	}
	if len(c.CodeFiles) != 1 {
		t.Fatalf("code files: got %d want 1", len(c.CodeFiles))
	}
	code := c.CodeFiles[0].Code
	if code == "" {
		t.Fatal("expected hydrated code from embed")
	}
	if !strings.Contains(code, "sync.Once") {
		t.Fatal("expected sync.Once in present.go body")
	}
}
