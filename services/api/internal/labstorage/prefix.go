package labstorage

import (
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

var (
	ErrPracticePathMissing = errors.New("practice.path missing for gcs storage")
	ErrInvalidPracticePath = errors.New("practice.path contains invalid segments")
)

// BucketName returns practice.bucket or defaultBucket.
func BucketName(practice bson.M, defaultBucket string) string {
	if b, ok := practice["bucket"].(string); ok {
		if s := strings.TrimSpace(b); s != "" {
			return s
		}
	}
	return strings.TrimSpace(defaultBucket)
}

// ObjectPrefix returns the GCS object key prefix (no leading slash, no gs:// scheme)
// for listing files, e.g. labs/system-design/caching/go
func ObjectPrefix(practice bson.M, languageNorm string) (string, error) {
	rawPath, ok := practice["path"].(string)
	if !ok || strings.TrimSpace(rawPath) == "" {
		return "", ErrPracticePathMissing
	}
	base := strings.Trim(strings.TrimSpace(rawPath), "/")
	if base == "" || strings.Contains(base, "..") {
		return "", ErrInvalidPracticePath
	}

	langs, ok := practice["languages"].(bson.A)
	if !ok || len(langs) == 0 {
		return base, nil
	}

	want := matchLanguageToken(languageNorm)
	for _, item := range langs {
		m, ok := item.(bson.M)
		if !ok {
			continue
		}
		t, _ := m["type"].(string)
		seg, _ := m["pathSegment"].(string)
		seg = strings.Trim(strings.TrimSpace(seg), "/")
		if seg == "" {
			continue
		}
		if matchLanguageToken(t) == want {
			return base + "/" + seg, nil
		}
	}
	for _, item := range langs {
		m, ok := item.(bson.M)
		if !ok {
			continue
		}
		seg, _ := m["pathSegment"].(string)
		seg = strings.Trim(strings.TrimSpace(seg), "/")
		if seg != "" {
			return base + "/" + seg, nil
		}
	}
	return base, nil
}

func matchLanguageToken(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "py", "python":
		return "python"
	case "ts", "typescript":
		return "typescript"
	default:
		return "go"
	}
}
