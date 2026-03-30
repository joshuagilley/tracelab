package curriculumconfig

import (
	"embed"
	"encoding/json"
	"io/fs"
	"strings"
	"testing"
)

//go:embed testdata/labs/*.json
var labFixtures embed.FS

//go:embed testdata/concepts/*.json
var conceptFixtures embed.FS

func TestLabFixtures(t *testing.T) {
	entries, err := fs.ReadDir(labFixtures, "testdata/labs")
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		name := e.Name()
		raw, err := labFixtures.ReadFile("testdata/labs/" + name)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		var doc map[string]any
		if err := json.Unmarshal(raw, &doc); err != nil {
			t.Fatalf("%s: json: %v", name, err)
		}
		errs := ValidateLabDocument(doc)
		switch {
		case strings.HasPrefix(name, "ok_"):
			if len(errs) > 0 {
				t.Fatalf("%s: expected no errors, got:\n- %s", name, strings.Join(errs, "\n- "))
			}
		case strings.HasPrefix(name, "err_"):
			if len(errs) == 0 {
				t.Fatalf("%s: expected validation errors, got none", name)
			}
		default:
			t.Fatalf("%s: fixture name must start with ok_ or err_", name)
		}
	}
}

func TestConceptFixtures(t *testing.T) {
	entries, err := fs.ReadDir(conceptFixtures, "testdata/concepts")
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		name := e.Name()
		raw, err := conceptFixtures.ReadFile("testdata/concepts/" + name)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		var doc map[string]any
		if err := json.Unmarshal(raw, &doc); err != nil {
			t.Fatalf("%s: json: %v", name, err)
		}
		errs := ValidateConceptDocument(doc)
		switch {
		case strings.HasPrefix(name, "ok_"):
			if len(errs) > 0 {
				t.Fatalf("%s: expected no errors, got:\n- %s", name, strings.Join(errs, "\n- "))
			}
		case strings.HasPrefix(name, "err_"):
			if len(errs) == 0 {
				t.Fatalf("%s: expected validation errors, got none", name)
			}
		default:
			t.Fatalf("%s: fixture name must start with ok_ or err_", name)
		}
	}
}

func TestValidatePracticeSpecificMessages(t *testing.T) {
	errs := ValidatePractice(map[string]any{
		"zipName": "x.zip",
		"folder":  "lab",
		"files":   []any{},
	})
	if len(errs) == 0 || !strings.Contains(strings.Join(errs, " "), "at least one file") {
		t.Fatalf("expected empty files error, got %v", errs)
	}
}
