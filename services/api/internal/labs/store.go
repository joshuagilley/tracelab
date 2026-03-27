package labs

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
)

//go:embed data/*.json
var embeddedFiles embed.FS

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
		byLab[e.lab] = list
		index[e.lab] = make(map[string]LabConcept)
		for _, c := range list {
			index[e.lab][c.Slug] = c
		}
	}

	return &MemoryStore{byLab: byLab, index: index}, nil
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
