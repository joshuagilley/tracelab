package catalog

import (
	"go.mongodb.org/mongo-driver/bson"
)

// labHasTopics reports whether the lab document uses the new structure (topics[], concepts in Concepts collection).
func labHasTopics(lab bson.M) bool {
	raw, ok := lab["topics"]
	if !ok || raw == nil {
		return false
	}
	arr, ok := asAnySlice(raw)
	return ok && len(arr) > 0
}

func slugInTopics(lab bson.M, slug string) bool {
	raw, ok := lab["topics"]
	if !ok || raw == nil {
		return true
	}
	arr, ok := asAnySlice(raw)
	if !ok {
		return false
	}
	for _, t := range arr {
		tm, ok := t.(bson.M)
		if !ok {
			continue
		}
		slugsRaw, ok := tm["conceptSlugs"]
		if !ok || slugsRaw == nil {
			continue
		}
		sa, ok := asAnySlice(slugsRaw)
		if !ok {
			continue
		}
		for _, s := range sa {
			ss, ok := s.(string)
			if ok && ss == slug {
				return true
			}
		}
	}
	return false
}

// topicsToNavSections builds sidebar-shaped navSections from topics + concept titles (by slug).
func topicsToNavSections(topicsRaw any, bySlug map[string]bson.M) bson.A {
	arr, ok := asAnySlice(topicsRaw)
	if !ok {
		return bson.A{}
	}
	out := make(bson.A, 0, len(arr))
	for _, t := range arr {
		tm, ok := t.(bson.M)
		if !ok {
			continue
		}
		id, _ := tm["id"].(string)
		title, _ := tm["title"].(string)
		blurb, _ := tm["blurb"].(string)
		items := bson.A{}
		slugsRaw, _ := tm["conceptSlugs"]
		sa, ok := asAnySlice(slugsRaw)
		if ok {
			for _, sr := range sa {
				slug, ok := sr.(string)
				if !ok || slug == "" {
					continue
				}
				label := ""
				if c, ok := bySlug[slug]; ok {
					if tt, ok := c["title"].(string); ok {
						label = tt
					}
				}
				items = append(items, bson.M{"label": label, "slug": slug})
			}
		}
		out = append(out, bson.M{
			"id":    id,
			"title": title,
			"blurb": blurb,
			"items": items,
		})
	}
	return out
}

func indexConceptsBySlug(docs []bson.M) map[string]bson.M {
	m := make(map[string]bson.M)
	for _, d := range docs {
		s, ok := d["slug"].(string)
		if ok && s != "" {
			m[s] = d
		}
	}
	return m
}

// catalogRowsFromConceptDocs builds list-view rows for GET /api/catalog/labs (LessonCatalogRow-shaped).
func catalogRowsFromConceptDocs(docs []bson.M) []any {
	out := make([]any, 0, len(docs))
	for _, d := range docs {
		out = append(out, catalogRowLight(d))
	}
	return out
}

func catalogRowLight(d bson.M) bson.M {
	row := bson.M{}
	for _, k := range []string{"id", "slug", "title", "summary", "difficulty", "tags", "status", "labKind", "vizType"} {
		if v, ok := d[k]; ok {
			row[k] = v
		}
	}
	if cf, ok := d["codeFiles"]; ok {
		row["codeFiles"] = codeFilesNamesOnly(cf)
	}
	return row
}

func codeFilesNamesOnly(raw any) any {
	arr, ok := asAnySlice(raw)
	if !ok {
		return bson.A{}
	}
	out := bson.A{}
	for _, item := range arr {
		cm, ok := item.(bson.M)
		if !ok {
			continue
		}
		name, _ := cm["name"].(string)
		lang, _ := cm["lang"].(string)
		m := bson.M{"name": name, "lang": lang}
		if role, ok := cm["role"]; ok {
			m["role"] = role
		}
		out = append(out, m)
	}
	return out
}

func conceptLabID(d bson.M) string {
	if s, ok := d["labId"].(string); ok && s != "" {
		return s
	}
	if s, ok := d["lab"].(string); ok {
		return s
	}
	return ""
}
