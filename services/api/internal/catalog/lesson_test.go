package catalog

import (
	"testing"

	"go.mongodb.org/mongo-driver/bson"
)

func TestInferCodeLangFromName(t *testing.T) {
	cases := map[string]string{
		"main.go":     "go",
		"go.mod":      "go",
		"README.md":   "markdown",
		"app.py":      "python",
		"index.ts":    "typescript",
		"view.tsx":    "tsx",
		"bundle.js":   "javascript",
		"page.jsx":    "jsx",
		"data.json":   "json",
		"cfg.yaml":    "yaml",
		"cfg.yml":     "yaml",
		"script.sh":   "shell",
		"unknown.xyz": "text",
	}
	for name, want := range cases {
		if got := inferCodeLangFromName(name); got != want {
			t.Errorf("%q: got %q want %q", name, got, want)
		}
	}
}

func TestAsAnySlice(t *testing.T) {
	a := bson.A{bson.M{"x": 1}}
	got, ok := asAnySlice(a)
	if !ok || len(got) != 1 {
		t.Fatalf("bson.A: ok=%v len=%d", ok, len(got))
	}
	s := []any{1, 2}
	got, ok = asAnySlice(s)
	if !ok || len(got) != 2 {
		t.Fatalf("[]any: ok=%v", ok)
	}
	if _, ok = asAnySlice("nope"); ok {
		t.Fatal("expected false")
	}
}

func TestMergeLesson_codeFilesPrecedence(t *testing.T) {
	row := bson.M{
		"slug":  "caching",
		"title": "From row",
		"codeFiles": bson.A{
			bson.M{"name": "present.go", "lang": "go"},
		},
	}
	detail := bson.M{
		"codeFiles": bson.A{
			bson.M{"name": "present.go", "lang": "go", "code": "package main"},
		},
	}
	out := mergeLesson(row, detail)
	cf, ok := out["codeFiles"].([]any)
	if !ok || len(cf) != 1 {
		t.Fatalf("codeFiles: %T %#v", out["codeFiles"], out["codeFiles"])
	}
}

func TestMergeLesson_detailOnly(t *testing.T) {
	detail := bson.M{
		"slug":  "rate-limiting",
		"title": "Rate limiting",
		"codeFiles": bson.A{
			bson.M{"name": "main.go", "lang": "go", "code": "package main"},
		},
	}
	out := mergeLesson(nil, detail)
	if out["slug"] != "rate-limiting" {
		t.Fatalf("slug: %v", out["slug"])
	}
	cf, ok := out["codeFiles"].([]any)
	if !ok || len(cf) != 1 {
		t.Fatalf("codeFiles: %v", out["codeFiles"])
	}
}

func TestFindConceptRow(t *testing.T) {
	lab := bson.M{
		"concepts": bson.A{
			bson.M{"slug": "a", "title": "A"},
			bson.M{"slug": "b", "title": "B"},
		},
	}
	row, err := findConceptRow(lab, "b")
	if err != nil || row["title"] != "B" {
		t.Fatalf("err=%v row=%v", err, row)
	}
	_, err = findConceptRow(lab, "missing")
	if err != ErrConceptNotInCatalog {
		t.Fatalf("got %v", err)
	}
}
