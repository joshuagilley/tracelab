package labconfig

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/tracelab/api/internal/practicefiles"
)

// LabsAllowlist holds allowed scaffold basenames per normalized language (from Config, config_type: labs).
type LabsAllowlist struct {
	byLang map[string]map[string]struct{}
}

// LoadLabsAllowlist reads the single `config_type: "labs"` document from Config.
// On ErrNoDocuments or empty structure, returns (nil, nil) so callers can skip filtering.
func LoadLabsAllowlist(ctx context.Context, coll *mongo.Collection) (*LabsAllowlist, error) {
	if coll == nil {
		return nil, nil
	}
	var doc bson.M
	err := coll.FindOne(ctx, bson.M{"config_type": "labs"}).Decode(&doc)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	raw, ok := asBSONMap(doc["language_file_structure"])
	if !ok || len(raw) == 0 {
		return nil, nil
	}
	byLang := make(map[string]map[string]struct{})
	for k, v := range raw {
		lang := practicefiles.NormalizeLanguage(k)
		if lang == "" {
			continue
		}
		names, ok := asStringSlice(v)
		if !ok || len(names) == 0 {
			continue
		}
		set := make(map[string]struct{}, len(names))
		for _, n := range names {
			base := strings.TrimSpace(n)
			if base == "" || strings.Contains(base, "/") || strings.Contains(base, "\\") {
				continue
			}
			set[base] = struct{}{}
		}
		if len(set) == 0 {
			continue
		}
		byLang[lang] = set
	}
	if len(byLang) == 0 {
		return nil, nil
	}
	return &LabsAllowlist{byLang: byLang}, nil
}

// Basenames returns the set of allowed file basenames for lang, or nil when no allowlist applies
// (read all objects under the prefix — backward compatible).
func (a *LabsAllowlist) Basenames(lang string) map[string]struct{} {
	if a == nil || len(a.byLang) == 0 {
		return nil
	}
	norm := practicefiles.NormalizeLanguage(lang)
	set, ok := a.byLang[norm]
	if !ok || len(set) == 0 {
		return nil
	}
	return set
}

func asBSONMap(v any) (bson.M, bool) {
	switch m := v.(type) {
	case bson.M:
		return m, true
	case map[string]any:
		return bson.M(m), true
	default:
		return nil, false
	}
}

func asStringSlice(v any) ([]string, bool) {
	switch x := v.(type) {
	case bson.A:
		out := make([]string, 0, len(x))
		for _, it := range x {
			s, ok := it.(string)
			if !ok {
				return nil, false
			}
			out = append(out, s)
		}
		return out, true
	case []any:
		out := make([]string, 0, len(x))
		for _, it := range x {
			s, ok := it.(string)
			if !ok {
				return nil, false
			}
			out = append(out, s)
		}
		return out, true
	case []string:
		return x, true
	default:
		return nil, false
	}
}
