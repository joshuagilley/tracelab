package concepts

import (
	"encoding/json"
	"net/http"
	"strings"
)

type Handler struct {
	store Store
}

func NewHandler(store Store) *Handler {
	return &Handler{store: store}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	respond(w, http.StatusOK, h.store.List())
}

func (h *Handler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	// Path: /api/concepts/{slug}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	slug := parts[2]

	concept, err := h.store.GetBySlug(slug)
	if err != nil {
		http.Error(w, "concept not found", http.StatusNotFound)
		return
	}
	respond(w, http.StatusOK, concept)
}

func respond(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
