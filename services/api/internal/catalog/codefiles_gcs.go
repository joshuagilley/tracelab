package catalog

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"github.com/tracelab/api/internal/labstorage"
	"github.com/tracelab/api/internal/practicefiles"
	"go.mongodb.org/mongo-driver/bson"
)

func codeFilesStorageIsGCS(doc bson.M) bool {
	if doc == nil {
		return false
	}
	st, _ := doc["codeFilesStorage"].(string)
	return strings.EqualFold(strings.TrimSpace(st), "gcs")
}

// roleForConceptCodeBasename maps GCS lesson filenames to UI roles (good.* → present).
func roleForConceptCodeBasename(b string) string {
	lower := strings.ToLower(b)
	switch {
	case strings.HasPrefix(lower, "good."):
		return "present"
	case strings.HasPrefix(lower, "bad."):
		return "bad"
	case strings.HasPrefix(lower, "exercise."):
		return "exercise"
	default:
		return ""
	}
}

func syntheticCodeFileEntriesFromGCS(files []practicefiles.File) []any {
	seen := make(map[string]struct{})
	var bases []string
	for _, f := range files {
		b := practicefiles.NormalizedBaseName(f.Name)
		if b == "" {
			continue
		}
		if _, ok := seen[b]; ok {
			continue
		}
		seen[b] = struct{}{}
		bases = append(bases, b)
	}
	sort.Strings(bases)
	out := make([]any, 0, len(bases))
	for _, b := range bases {
		m := bson.M{"name": b, "lang": InferCodeLangFromName(b)}
		if r := roleForConceptCodeBasename(b); r != "" {
			m["role"] = r
		}
		out = append(out, m)
	}
	return out
}

// HydrateCodeFilesFromGCS fills lesson codeFiles[].code from GCS when codeFilesStorage is gcs.
// If codeFiles is missing or empty, entries are inferred from objects under codeFilesPath.
// Removes codeFilesStorage, codeFilesPath, and codeFilesBucket from lesson before returning.
func HydrateCodeFilesFromGCS(ctx context.Context, svc *labstorage.Service, lesson bson.M, conceptID string) error {
	st, _ := lesson["codeFilesStorage"].(string)
	if !strings.EqualFold(strings.TrimSpace(st), "gcs") {
		return nil
	}
	if svc == nil || !svc.Enabled() {
		return fmt.Errorf("codeFilesStorage is gcs but GCS is not configured on the API")
	}

	path := strings.Trim(strings.TrimSpace(fmt.Sprint(lesson["codeFilesPath"])), "/")
	if path == "" {
		path = strings.Trim("concepts/"+strings.Trim(conceptID, "/"), "/")
	}
	bucket := strings.TrimSpace(fmt.Sprint(lesson["codeFilesBucket"]))

	files, err := svc.ReadFilesUnderPrefix(ctx, bucket, path)
	if err != nil {
		return fmt.Errorf("read concept code files prefix %q: %w", path, err)
	}

	byBase := make(map[string]string)
	for _, f := range files {
		b := practicefiles.NormalizedBaseName(f.Name)
		if b != "" {
			byBase[b] = f.Content
		}
	}

	raw, _ := lesson["codeFiles"]
	arr, ok := asAnySlice(raw)
	if !ok || len(arr) == 0 {
		syn := syntheticCodeFileEntriesFromGCS(files)
		a := bson.A{}
		for _, item := range syn {
			a = append(a, item)
		}
		lesson["codeFiles"] = a
		arr, _ = asAnySlice(lesson["codeFiles"])
	}

	for _, item := range arr {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		name, _ := cm["name"].(string)
		base := practicefiles.NormalizedBaseName(name)
		if body, ok := byBase[base]; ok {
			cm["code"] = body
		}
	}

	arr2, _ := asAnySlice(lesson["codeFiles"])
	lesson["codeFiles"] = normalizeCodeFilesForLesson(arr2)

	delete(lesson, "codeFilesStorage")
	delete(lesson, "codeFilesPath")
	delete(lesson, "codeFilesBucket")
	return nil
}

// SlimCodeFilesForAPI strips embedded bodies from concept detail before merge when code lives in GCS.
func SlimCodeFilesForAPI(doc bson.M) {
	if doc == nil {
		return
	}
	st, _ := doc["codeFilesStorage"].(string)
	if !strings.EqualFold(strings.TrimSpace(st), "gcs") {
		return
	}
	raw, ok := doc["codeFiles"]
	if !ok || raw == nil {
		return
	}
	arr, ok := asAnySlice(raw)
	if !ok {
		return
	}
	out := bson.A{}
	for _, item := range arr {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		row := bson.M{}
		if v, ok := cm["name"]; ok {
			row["name"] = v
		}
		if v, ok := cm["lang"]; ok {
			row["lang"] = v
		}
		if v, ok := cm["role"]; ok {
			row["role"] = v
		}
		out = append(out, row)
	}
	doc["codeFiles"] = out
}
