package lessons

import (
	"encoding/json"
	"errors"
	"io/fs"
	"net/http"
	"strings"
)

type Handler struct {
	store *MemoryStore
}

func NewHandler(store *MemoryStore) *Handler {
	return &Handler{store: store}
}

var validSections = map[string]struct{}{
	"system-design":      {},
	"api-design":         {},
	"design-patterns":    {},
	"data-science":       {},
	"database-design":    {},
	"cloud-architecture": {},
	"concurrency":        {},
}

// ServeHTTP handles GET /api/sections/{section}/concepts and .../concepts/{slug}.
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	p := strings.TrimPrefix(r.URL.Path, "/api/sections/")
	p = strings.Trim(p, "/")
	parts := strings.Split(p, "/")

	if len(parts) < 2 || parts[1] != "concepts" {
		http.NotFound(w, r)
		return
	}

	section := parts[0]
	if _, ok := validSections[section]; !ok {
		http.NotFound(w, r)
		return
	}

	if len(parts) == 2 {
		list, err := h.store.ListSummaries(section)
		if err != nil {
			if errors.Is(err, fs.ErrNotExist) {
				http.NotFound(w, r)
				return
			}
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		respondJSON(w, http.StatusOK, list)
		return
	}

	if len(parts) == 3 {
		slug := parts[2]
		c, err := h.store.Get(section, slug)
		if err != nil {
			if errors.Is(err, fs.ErrNotExist) {
				http.Error(w, "concept not found", http.StatusNotFound)
				return
			}
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		respondJSON(w, http.StatusOK, c)
		return
	}

	http.NotFound(w, r)
}

func respondJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
