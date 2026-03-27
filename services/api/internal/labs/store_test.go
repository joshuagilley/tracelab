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
	if len(c.CodeFiles) != 2 {
		t.Fatalf("code files: got %d want 2", len(c.CodeFiles))
	}
	var sawPresent, sawBad bool
	for _, f := range c.CodeFiles {
		switch f.Name {
		case "present.go":
			sawPresent = true
			if !strings.Contains(f.Code, "sync.Once") {
				t.Fatal("expected sync.Once in present.go")
			}
			if !strings.Contains(f.Code, "GetLogger") {
				t.Fatal("expected GetLogger in present.go")
			}
		case "bad.go":
			sawBad = true
			if !strings.Contains(f.Code, "NewLogger") {
				t.Fatal("expected NewLogger in bad.go")
			}
		}
	}
	if !sawPresent || !sawBad {
		t.Fatal("expected present.go and bad.go in code files")
	}
}

func TestHydrateDesignPatternsDependencyInjection(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("design-patterns", "dependency-injection")
	if err != nil {
		t.Fatal(err)
	}
	if len(c.CodeFiles) != 2 {
		t.Fatalf("code files: got %d want 2", len(c.CodeFiles))
	}
	var sawPresent, sawBad bool
	for _, f := range c.CodeFiles {
		switch f.Name {
		case "present.go":
			sawPresent = true
			if !strings.Contains(f.Code, "type ObjectUploader interface") {
				t.Fatal("expected ObjectUploader in present.go")
			}
		case "bad.go":
			sawBad = true
			if !strings.Contains(f.Code, "SprawlConfig") {
				t.Fatal("expected SprawlConfig in bad.go")
			}
		}
	}
	if !sawPresent || !sawBad {
		t.Fatal("expected present.go and bad.go in code files")
	}
}
