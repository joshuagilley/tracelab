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

func TestHydrateDataScienceNumericalComputing(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("data-science", "numerical-computing")
	if err != nil {
		t.Fatal(err)
	}
	if len(c.CodeFiles) != 4 {
		t.Fatalf("code files: got %d want 4", len(c.CodeFiles))
	}
	var sawPresent, sawBad, sawDemo, sawNotes bool
	for _, f := range c.CodeFiles {
		switch f.Name {
		case "present.py":
			sawPresent = true
			if !strings.Contains(f.Code, "make_array") {
				t.Fatal("expected make_array in present.py")
			}
		case "bad.py":
			sawBad = true
			if !strings.Contains(f.Code, "make_ones_bad") {
				t.Fatal("expected make_ones_bad in bad.py")
			}
		case "demo/main.py":
			sawDemo = true
			if !strings.Contains(f.Code, "import numpy") {
				t.Fatal("expected numpy import in demo")
			}
		case "notes.md":
			sawNotes = true
			if !strings.Contains(f.Code, "TraceLab") {
				t.Fatal("expected TraceLab in notes.md")
			}
		}
	}
	if !sawPresent || !sawBad || !sawDemo || !sawNotes {
		t.Fatal("expected present.py, bad.py, demo/main.py, and notes.md")
	}
}
