package curriculumconfig

import (
	"fmt"
	"strings"
)

// ValidatePractice checks the Mongo `practice` object used for downloadable ZIPs.
// Returns a list of human-readable problems (empty if OK). Matches client rules in apps/web practiceZip.
func ValidatePractice(raw any) []string {
	if raw == nil {
		return nil
	}
	m, ok := raw.(map[string]any)
	if !ok {
		return []string{"practice: must be an object"}
	}
	var out []string
	add := func(s string) { out = append(out, s) }

	z, zok := m["zipName"].(string)
	if !zok || strings.TrimSpace(z) == "" {
		add("practice.zipName: required non-empty string")
	}

	folder, fok := m["folder"].(string)
	if !fok || strings.TrimSpace(folder) == "" {
		add("practice.folder: required non-empty string")
	} else if msg := validatePathSegments(folder, "practice.folder"); msg != "" {
		add("practice.folder: " + msg)
	}

	filesRaw, ok := m["files"]
	if !ok {
		add("practice.files: required array")
		return out
	}
	filesArr, ok := filesRaw.([]any)
	if !ok {
		add("practice.files: must be an array")
		return out
	}
	if len(filesArr) == 0 {
		add("practice.files: must contain at least one file")
	}
	for i, item := range filesArr {
		fm, ok := item.(map[string]any)
		if !ok {
			add(fmt.Sprintf("practice.files[%d]: must be an object", i))
			continue
		}
		name, nok := fm["name"].(string)
		if !nok || strings.TrimSpace(name) == "" {
			add(fmt.Sprintf("practice.files[%d].name: required non-empty string", i))
		} else if msg := validatePathSegments(name, "path"); msg != "" {
			add(fmt.Sprintf("practice.files[%d].name: %s", i, msg))
		}
		if _, cok := fm["content"].(string); !cok {
			add(fmt.Sprintf("practice.files[%d].content: must be a string", i))
		}
	}
	return out
}

// ValidateLabDocument checks a Labs collection document (library + sidebar + concept rows).
func ValidateLabDocument(raw map[string]any) []string {
	var out []string
	add := func(s string) { out = append(out, s) }

	id, _ := raw["_id"].(string)
	if strings.TrimSpace(id) == "" {
		add("lab._id: required non-empty string (lab id)")
	}

	if _, bad := raw["practice"]; bad {
		add("lab document must not contain top-level practice (put practice on the Concepts collection document for that slug)")
	}

	conceptsRaw, ok := raw["concepts"]
	if !ok || conceptsRaw == nil {
		add("lab.concepts: required array")
		return out
	}
	concepts, ok := conceptsRaw.([]any)
	if !ok {
		add("lab.concepts: must be an array")
		return out
	}
	if len(concepts) == 0 {
		add("lab.concepts: must contain at least one concept")
	}

	slugs := map[string]int{}
	for i, item := range concepts {
		cm, ok := item.(map[string]any)
		if !ok {
			add(fmt.Sprintf("lab.concepts[%d]: must be an object", i))
			continue
		}
		out = append(out, validateConceptRow(cm, i, id)...)
		if s, ok := cm["slug"].(string); ok && strings.TrimSpace(s) != "" {
			slugs[s]++
		}
	}
	for s, n := range slugs {
		if n > 1 {
			add(fmt.Sprintf("lab.concepts: duplicate slug %q (%d rows)", s, n))
		}
	}

	navRaw, hasNav := raw["navSections"]
	if !hasNav || navRaw == nil {
		return out
	}
	navArr, ok := navRaw.([]any)
	if !ok {
		add("lab.navSections: must be an array when present")
		return out
	}
	known := map[string]struct{}{}
	for s := range slugs {
		known[s] = struct{}{}
	}
	for si, sec := range navArr {
		sm, ok := sec.(map[string]any)
		if !ok {
			add(fmt.Sprintf("lab.navSections[%d]: must be an object", si))
			continue
		}
		if sid, _ := sm["id"].(string); strings.TrimSpace(sid) == "" {
			add(fmt.Sprintf("lab.navSections[%d].id: required non-empty string", si))
		}
		if _, ok := sm["title"].(string); !ok {
			add(fmt.Sprintf("lab.navSections[%d].title: required string", si))
		}
		if _, ok := sm["blurb"].(string); !ok {
			add(fmt.Sprintf("lab.navSections[%d].blurb: required string", si))
		}
		itemsRaw, ok := sm["items"]
		if !ok || itemsRaw == nil {
			add(fmt.Sprintf("lab.navSections[%d].items: required array", si))
			continue
		}
		items, ok := itemsRaw.([]any)
		if !ok {
			add(fmt.Sprintf("lab.navSections[%d].items: must be an array", si))
			continue
		}
		for ii, it := range items {
			im, ok := it.(map[string]any)
			if !ok {
				add(fmt.Sprintf("lab.navSections[%d].items[%d]: must be an object", si, ii))
				continue
			}
			if lbl, _ := im["label"].(string); strings.TrimSpace(lbl) == "" {
				add(fmt.Sprintf("lab.navSections[%d].items[%d].label: required non-empty string", si, ii))
			}
			ns, hasSlug := im["slug"].(string)
			if !hasSlug || strings.TrimSpace(ns) == "" {
				continue
			}
			if _, ok := known[ns]; !ok {
				add(fmt.Sprintf("lab.navSections[%d].items[%d]: slug %q has no matching lab.concepts[].slug", si, ii, ns))
			}
		}
	}
	return out
}

// ValidateConceptDocument checks a Concepts collection document (detail merge target).
func ValidateConceptDocument(raw map[string]any) []string {
	var out []string
	if raw == nil {
		return nil
	}
	if p, ok := raw["practice"]; ok && p != nil {
		out = append(out, ValidatePractice(p)...)
	}
	if cf, ok := raw["codeFiles"]; ok && cf != nil {
		arr, ok := cf.([]any)
		if !ok {
			return append(out, "codeFiles: must be an array when present")
		}
		for i, item := range arr {
			cm, ok := item.(map[string]any)
			if !ok {
				out = append(out, fmt.Sprintf("codeFiles[%d]: must be an object", i))
				continue
			}
			if n, _ := cm["name"].(string); strings.TrimSpace(n) == "" {
				out = append(out, fmt.Sprintf("codeFiles[%d].name: required non-empty string", i))
			}
			if _, ok := cm["lang"].(string); !ok || strings.TrimSpace(cm["lang"].(string)) == "" {
				out = append(out, fmt.Sprintf("codeFiles[%d].lang: required non-empty string", i))
			}
			if c := cm["code"]; c != nil {
				if _, ok := c.(string); !ok {
					out = append(out, fmt.Sprintf("codeFiles[%d].code: must be a string when present", i))
				}
			}
		}
	}
	return out
}

func validateConceptRow(cm map[string]any, index int, labID string) []string {
	var out []string
	add := func(s string) { out = append(out, fmt.Sprintf("lab.concepts[%d].%s", index, s)) }

	if s, ok := cm["slug"].(string); !ok || strings.TrimSpace(s) == "" {
		add("slug: required non-empty string")
	}
	if s, ok := cm["id"].(string); !ok || strings.TrimSpace(s) == "" {
		add("id: required non-empty string")
	}
	if s, ok := cm["title"].(string); !ok || strings.TrimSpace(s) == "" {
		add("title: required non-empty string")
	}
	if _, ok := cm["summary"].(string); !ok {
		add("summary: required string")
	}
	if d, ok := cm["difficulty"].(string); !ok || !isDifficulty(d) {
		add("difficulty: must be one of easy, medium, hard")
	}
	if _, ok := cm["tags"].([]any); !ok {
		add("tags: required array (may be empty)")
	}
	if st, ok := cm["status"].(string); !ok || (st != "available" && st != "coming-soon") {
		add("status: must be \"available\" or \"coming-soon\"")
	}
	if lk, ok := cm["labKind"].(string); !ok || strings.TrimSpace(lk) == "" {
		add("labKind: required non-empty string")
	} else if labID != "" && lk != labID {
		add(fmt.Sprintf("labKind: expected %q to match lab._id", labID))
	}
	if vt, ok := cm["vizType"].(string); !ok || strings.TrimSpace(vt) == "" {
		add("vizType: required non-empty string")
	}
	if cf, ok := cm["codeFiles"]; ok && cf != nil {
		arr, ok := cf.([]any)
		if !ok {
			add("codeFiles: must be an array when present")
		} else {
			for fi, item := range arr {
				fm, ok := item.(map[string]any)
				if !ok {
					add(fmt.Sprintf("codeFiles[%d]: must be an object", fi))
					continue
				}
				if n, _ := fm["name"].(string); strings.TrimSpace(n) == "" {
					add(fmt.Sprintf("codeFiles[%d].name: required non-empty string", fi))
				}
				if l, _ := fm["lang"].(string); strings.TrimSpace(l) == "" {
					add(fmt.Sprintf("codeFiles[%d].lang: required non-empty string", fi))
				}
			}
		}
	}
	return out
}

func isDifficulty(s string) bool {
	switch s {
	case "easy", "medium", "hard":
		return true
	default:
		return false
	}
}

func validatePathSegments(path string, ctx string) string {
	path = strings.TrimSpace(strings.ReplaceAll(path, `\`, `/`))
	parts := strings.Split(path, "/")
	for _, p := range parts {
		if p == "" {
			return fmt.Sprintf("invalid %s: empty path segment in %q", ctx, path)
		}
		if p == "." || p == ".." {
			return fmt.Sprintf("invalid %s: segment %q not allowed in %q", ctx, p, path)
		}
	}
	if len(parts) == 0 {
		return fmt.Sprintf("invalid %s: empty", ctx)
	}
	return ""
}
