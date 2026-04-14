package catalog

import (
	"testing"

	"go.mongodb.org/mongo-driver/bson"
)

func TestRoleForConceptCodeBasename(t *testing.T) {
	t.Parallel()
	if got, want := roleForConceptCodeBasename("good.go"), "present"; got != want {
		t.Fatalf("good.go: got %q want %q", got, want)
	}
	if got, want := roleForConceptCodeBasename("bad.ts"), "bad"; got != want {
		t.Fatalf("bad.ts: got %q want %q", got, want)
	}
	if got, want := roleForConceptCodeBasename("exercise.go"), "exercise"; got != want {
		t.Fatalf("exercise.go: got %q want %q", got, want)
	}
	if roleForConceptCodeBasename("helper.go") != "" {
		t.Fatal("expected empty role")
	}
}

func TestMergeLesson_gcsDetailNoEmbeddedCodeFiles(t *testing.T) {
	t.Parallel()
	detail := bson.M{
		"slug":               "caching",
		"title":              "Caching",
		"codeFilesStorage":   "gcs",
		"codeFilesPath":      "concepts/system-design/caching",
		"codeFilesBucket":    "tracelab-labs",
		"codeFiles":         bson.A{},
	}
	row := bson.M{
		"slug": "caching",
		"codeFiles": bson.A{
			bson.M{"name": "present.go", "lang": "go"},
		},
	}
	out := mergeLesson(row, detail)
	cf, ok := out["codeFiles"].([]any)
	if !ok || len(cf) != 0 {
		t.Fatalf("expected empty codeFiles when detail is gcs with empty manifest, got %#v", out["codeFiles"])
	}
}
