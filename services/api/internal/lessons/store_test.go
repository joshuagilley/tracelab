package lessons

import (
	"strings"
	"testing"
)

func TestHydrateSystemDesignCaching(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("system-design", "caching")
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
			if !strings.Contains(f.Code, "LRUCache") {
				t.Fatal("expected LRUCache in present.go")
			}
		case "bad.go":
			sawBad = true
			if !strings.Contains(f.Code, "leakyUserCache") {
				t.Fatal("expected leakyUserCache in bad.go")
			}
		}
	}
	if !sawPresent || !sawBad {
		t.Fatal("expected present.go and bad.go only")
	}
}

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
		case "bad.go":
			sawBad = true
			if !strings.Contains(f.Code, "NewLogger") {
				t.Fatal("expected NewLogger in bad.go")
			}
		}
	}
	if !sawPresent || !sawBad {
		t.Fatal("expected present.go and bad.go only")
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
		t.Fatal("expected present.go and bad.go only")
	}
}

func TestHydrateAPIDesignRateLimiting(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("api-design", "rate-limiting")
	if err != nil {
		t.Fatal(err)
	}
	if len(c.CodeFiles) != 2 {
		t.Fatalf("code files: got %d want 2", len(c.CodeFiles))
	}
	for _, f := range c.CodeFiles {
		switch f.Name {
		case "present.go":
			if !strings.Contains(f.Code, "StatusTooManyRequests") {
				t.Fatal("expected 429 handling in present.go")
			}
		case "bad.go":
			if !strings.Contains(f.Code, "Anti-patterns") {
				t.Fatal("expected Anti-patterns in bad.go")
			}
		}
	}
}

func TestHydrateCloudArchitectureVPC(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("cloud-architecture", "vpc")
	if err != nil {
		t.Fatal(err)
	}
	if len(c.CodeFiles) != 2 {
		t.Fatalf("code files: got %d want 2", len(c.CodeFiles))
	}
	for _, f := range c.CodeFiles {
		switch f.Name {
		case "present.go":
			if !strings.Contains(f.Code, "10.0.0.0/16") {
				t.Fatal("expected VPC CIDR in present.go")
			}
		case "bad.go":
			if !strings.Contains(f.Code, "Anti-pattern") {
				t.Fatal("expected Anti-pattern in bad.go")
			}
		}
	}
}

func TestHydrateDatabaseDesignPrimaryKeys(t *testing.T) {
	s, err := NewMemoryStore()
	if err != nil {
		t.Fatal(err)
	}
	c, err := s.Get("database-design", "primary-keys-foreign-keys")
	if err != nil {
		t.Fatal(err)
	}
	if len(c.CodeFiles) != 2 {
		t.Fatalf("code files: got %d want 2", len(c.CodeFiles))
	}
	for _, f := range c.CodeFiles {
		switch f.Name {
		case "present.go":
			if !strings.Contains(f.Code, "REFERENCES users") {
				t.Fatal("expected REFERENCES users in present.go")
			}
		case "bad.go":
			if !strings.Contains(f.Code, "Anti-pattern") {
				t.Fatal("expected Anti-pattern in bad.go")
			}
		}
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
	if len(c.CodeFiles) != 2 {
		t.Fatalf("code files: got %d want 2", len(c.CodeFiles))
	}
	var sawPresent, sawBad bool
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
		}
	}
	if !sawPresent || !sawBad {
		t.Fatal("expected present.py and bad.py only")
	}
}
