package catalog

import (
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

// asAnySlice accepts bson.A or []any from various decode paths.
func asAnySlice(raw any) ([]any, bool) {
	switch v := raw.(type) {
	case bson.A:
		return []any(v), true
	case []any:
		return v, true
	default:
		return nil, false
	}
}

func findConceptRow(labDoc bson.M, slug string) (bson.M, error) {
	raw, ok := labDoc["concepts"]
	if !ok || raw == nil {
		return nil, ErrConceptNotInCatalog
	}
	arr, ok := asAnySlice(raw)
	if !ok {
		return nil, ErrConceptNotInCatalog
	}
	for _, item := range arr {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		s, ok := cm["slug"].(string)
		if ok && s == slug {
			return cm, nil
		}
	}
	return nil, ErrConceptNotInCatalog
}

// mergeLesson merges Labs concept row with optional Concepts detail.
// Detail document overrides catalog row fields except identity keys (_id, lab).
// When row is nil (concepts stored only in Concepts collection), detail supplies all fields including slug.
func mergeLesson(row, detail bson.M) bson.M {
	out := bson.M{}
	if row != nil {
		for k, v := range row {
			out[k] = v
		}
	}
	if detail != nil {
		for k, v := range detail {
			if k == "_id" || k == "lab" {
				continue
			}
			out[k] = v
		}
	}

	detailCF := codeFilesFromDoc(detail)
	var rowCF []any
	if row != nil {
		rowCF = codeFilesFromDoc(row)
	}
	var merged []any
	if len(detailCF) > 0 {
		merged = detailCF
	} else {
		merged = placeholderCodeFiles(rowCF)
	}
	out["codeFiles"] = normalizeCodeFilesForLesson(merged)
	return out
}

func codeFilesFromDoc(doc bson.M) []any {
	if doc == nil {
		return nil
	}
	raw, ok := doc["codeFiles"]
	if !ok || raw == nil {
		return nil
	}
	arr, ok := asAnySlice(raw)
	if !ok {
		return nil
	}
	return arr
}

// normalizeCodeFilesForLesson maps Mongo shapes to the SPA contract: body in "code",
// optional "lang" (inferred from filename when missing). Some docs use "content" like practice.files.
func normalizeCodeFilesForLesson(files []any) []any {
	if len(files) == 0 {
		return []any{}
	}
	out := make([]any, 0, len(files))
	for _, item := range files {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		m, ok := normalizeCodeFile(cm)
		if ok {
			out = append(out, m)
		}
	}
	return out
}

func normalizeCodeFile(cm bson.M) (bson.M, bool) {
	m := bson.M{}
	for k, v := range cm {
		m[k] = v
	}
	code, _ := m["code"].(string)
	if strings.TrimSpace(code) == "" {
		if c, ok := m["content"].(string); ok {
			m["code"] = c
		}
	}
	lang, _ := m["lang"].(string)
	if strings.TrimSpace(lang) == "" {
		name, _ := m["name"].(string)
		m["lang"] = inferCodeLangFromName(name)
	}
	return m, true
}

func inferCodeLangFromName(name string) string {
	lower := strings.ToLower(name)
	switch {
	case strings.HasSuffix(lower, ".go"):
		return "go"
	case strings.HasSuffix(lower, ".mod"):
		return "go"
	case strings.HasSuffix(lower, ".md"):
		return "markdown"
	case strings.HasSuffix(lower, ".py"):
		return "python"
	case strings.HasSuffix(lower, ".ts"):
		return "typescript"
	case strings.HasSuffix(lower, ".tsx"):
		return "tsx"
	case strings.HasSuffix(lower, ".js"):
		return "javascript"
	case strings.HasSuffix(lower, ".jsx"):
		return "jsx"
	case strings.HasSuffix(lower, ".json"):
		return "json"
	case strings.HasSuffix(lower, ".yaml"), strings.HasSuffix(lower, ".yml"):
		return "yaml"
	case strings.HasSuffix(lower, ".sh"):
		return "shell"
	default:
		return "text"
	}
}

// placeholderCodeFiles builds code file entries with empty bodies from row metadata (name, lang, role).
func placeholderCodeFiles(rowFiles []any) []any {
	if len(rowFiles) == 0 {
		return []any{}
	}
	out := make([]any, 0, len(rowFiles))
	for _, item := range rowFiles {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		name, _ := cm["name"].(string)
		lang, _ := cm["lang"].(string)
		role := cm["role"]
		m := bson.M{"name": name, "lang": lang, "code": ""}
		if role != nil {
			m["role"] = role
		}
		out = append(out, m)
	}
	return out
}
