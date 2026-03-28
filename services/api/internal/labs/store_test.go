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
	if len(c.CodeFiles) != 3 {
		t.Fatalf("code files: got %d want 3", len(c.CodeFiles))
	}
	var sawPresent, sawBad, sawDemo bool
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
		case "demo/main.go":
			sawDemo = true
			if !strings.Contains(f.Code, "package main") {
				t.Fatal("expected package main in demo")
			}
			if !strings.Contains(f.Code, "sync.Once") {
				t.Fatal("expected sync.Once in demo")
			}
		}
	}
	if !sawPresent || !sawBad || !sawDemo {
		t.Fatal("expected present.go, bad.go, and demo/main.go in code files")
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
	if len(c.CodeFiles) != 3 {
		t.Fatalf("code files: got %d want 3", len(c.CodeFiles))
	}
	var sawPresent, sawBad, sawDemo bool
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
		case "demo/main.go":
			sawDemo = true
			if !strings.Contains(f.Code, "package main") {
				t.Fatal("expected package main in demo")
			}
			if !strings.Contains(f.Code, "NewIngestService") {
				t.Fatal("expected NewIngestService in demo")
			}
		}
	}
	if !sawPresent || !sawBad || !sawDemo {
		t.Fatal("expected present.go, bad.go, and demo/main.go in code files")
	}
}
