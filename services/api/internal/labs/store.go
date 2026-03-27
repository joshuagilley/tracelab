package labs

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"path"
	"strings"
)

//go:embed data/*.json
var embeddedFiles embed.FS

//go:embed embed/design-patterns
var designPatternsCode embed.FS

// MemoryStore loads lab concepts from embedded JSON files.
type MemoryStore struct {
	byLab map[string][]LabConcept
	index map[string]map[string]LabConcept // lab -> slug -> concept
}

func NewMemoryStore() (*MemoryStore, error) {
	byLab := make(map[string][]LabConcept)
	index := make(map[string]map[string]LabConcept)

	entries := []struct {
		file string
		lab  string
	}{
		{"data/design-patterns.json", "design-patterns"},
		{"data/data-science.json", "data-science"},
	}

	for _, e := range entries {
		raw, err := embeddedFiles.ReadFile(e.file)
		if err != nil {
			return nil, fmt.Errorf("labs: read %s: %w", e.file, err)
		}
		var list []LabConcept
		if err := json.Unmarshal(raw, &list); err != nil {
			return nil, fmt.Errorf("labs: parse %s: %w", e.file, err)
		}
		if e.lab == "design-patterns" {
			if err := hydrateDesignPatternsCode(&list); err != nil {
				return nil, err
			}
		}
		byLab[e.lab] = list
		index[e.lab] = make(map[string]LabConcept)
		for _, c := range list {
			index[e.lab][c.Slug] = c
		}
	}

	return &MemoryStore{byLab: byLab, index: index}, nil
}

func hydrateDesignPatternsCode(list *[]LabConcept) error {
	for i := range *list {
		for j := range (*list)[i].CodeFiles {
			cf := &(*list)[i].CodeFiles[j]
			if cf.Embed == "" {
				if strings.TrimSpace(cf.Code) == "" {
					return fmt.Errorf("labs: concept %q code file %q has neither code nor embed", (*list)[i].Slug, cf.Name)
				}
				continue
			}
			p := path.Clean(cf.Embed)
			if strings.HasPrefix(p, "..") || strings.HasPrefix(p, "/") {
				return fmt.Errorf("labs: invalid embed path %q", cf.Embed)
			}
			b, err := designPatternsCode.ReadFile(path.Join("embed/design-patterns", p))
			if err != nil {
				return fmt.Errorf("labs: read embed design-patterns/%s: %w", p, err)
			}
			cf.Code = string(b)
		}
	}
	return nil
}

func (s *MemoryStore) List(lab string) ([]LabConcept, error) {
	list, ok := s.byLab[lab]
	if !ok {
		return nil, fs.ErrNotExist
	}
	return list, nil
}

func (s *MemoryStore) Get(lab, slug string) (LabConcept, error) {
	m, ok := s.index[lab]
	if !ok {
		return LabConcept{}, fs.ErrNotExist
	}
	c, ok := m[slug]
	if !ok {
		return LabConcept{}, fs.ErrNotExist
	}
	return c, nil
}
