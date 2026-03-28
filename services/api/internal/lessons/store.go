package lessons

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"path"
	"strings"
)

//go:embed data/*.json
var embeddedJSON embed.FS

//go:embed embed/system-design
var systemDesignCode embed.FS

//go:embed embed/design-patterns
var designPatternsCode embed.FS

//go:embed embed/data-science
var dataScienceCode embed.FS

//go:embed embed/database-design
var databaseDesignCode embed.FS

// MemoryStore loads lessons from embedded JSON and hydrates code from embed/{section}/.
type MemoryStore struct {
	bySection map[string][]Lesson
	index     map[string]map[string]Lesson
}

func NewMemoryStore() (*MemoryStore, error) {
	bySection := make(map[string][]Lesson)
	index := make(map[string]map[string]Lesson)

	entries := []struct {
		file    string
		section string
		codeFS  embed.FS
	}{
		{"data/system-design.json", "system-design", systemDesignCode},
		{"data/design-patterns.json", "design-patterns", designPatternsCode},
		{"data/data-science.json", "data-science", dataScienceCode},
		{"data/database-design.json", "database-design", databaseDesignCode},
	}

	for _, e := range entries {
		raw, err := embeddedJSON.ReadFile(e.file)
		if err != nil {
			return nil, fmt.Errorf("lessons: read %s: %w", e.file, err)
		}
		var list []Lesson
		if err := json.Unmarshal(raw, &list); err != nil {
			return nil, fmt.Errorf("lessons: parse %s: %w", e.file, err)
		}
		root := path.Join("embed", e.section)
		if err := hydrateCodeFromEmbed(e.codeFS, root, &list); err != nil {
			return nil, err
		}
		bySection[e.section] = list
		index[e.section] = make(map[string]Lesson)
		for _, c := range list {
			index[e.section][c.Slug] = c
		}
	}

	return &MemoryStore{bySection: bySection, index: index}, nil
}

func hydrateCodeFromEmbed(embedFS embed.FS, root string, list *[]Lesson) error {
	for i := range *list {
		for j := range (*list)[i].CodeFiles {
			cf := &(*list)[i].CodeFiles[j]
			if cf.Embed == "" {
				if strings.TrimSpace(cf.Code) == "" {
					return fmt.Errorf("lessons: concept %q code file %q has neither code nor embed", (*list)[i].Slug, cf.Name)
				}
				continue
			}
			p := path.Clean(cf.Embed)
			if strings.HasPrefix(p, "..") || strings.HasPrefix(p, "/") {
				return fmt.Errorf("lessons: invalid embed path %q", cf.Embed)
			}
			b, err := embedFS.ReadFile(path.Join(root, p))
			if err != nil {
				return fmt.Errorf("lessons: read embed %s/%s: %w", root, p, err)
			}
			cf.Code = string(b)
		}
	}
	return nil
}

func (s *MemoryStore) ListSummaries(section string) ([]LessonSummary, error) {
	list, ok := s.bySection[section]
	if !ok {
		return nil, fs.ErrNotExist
	}
	out := make([]LessonSummary, len(list))
	for i, l := range list {
		out[i] = summaryFromLesson(l)
	}
	return out, nil
}

func (s *MemoryStore) Get(section, slug string) (Lesson, error) {
	m, ok := s.index[section]
	if !ok {
		return Lesson{}, fs.ErrNotExist
	}
	c, ok := m[slug]
	if !ok {
		return Lesson{}, fs.ErrNotExist
	}
	return c, nil
}
