package labs

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

// ServeHTTP handles /api/labs/{lab}/concepts and /api/labs/{lab}/concepts/{slug}
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/labs/")
	path = strings.Trim(path, "/")
	parts := strings.Split(path, "/")

	if len(parts) < 2 || parts[1] != "concepts" {
		http.NotFound(w, r)
		return
	}

	lab := parts[0]
	if lab != "design-patterns" && lab != "data-science" {
		http.NotFound(w, r)
		return
	}

	if len(parts) == 2 {
		list, err := h.store.List(lab)
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
		c, err := h.store.Get(lab, slug)
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
