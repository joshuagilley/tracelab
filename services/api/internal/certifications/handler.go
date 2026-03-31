package certifications

import (
	"log"
	"net/http"

	"github.com/tracelab/api/internal/auth"
)

type Handler struct {
	store *Store
}

func NewHandler(store *Store) *Handler {
	return &Handler{store: store}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/certifications", h.list)
}

type listResponse struct {
	Certifications []Certification `json:"certifications"`
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	items, err := h.store.ListActive(r.Context())
	if err != nil {
		log.Printf("certifications.list: %v", err)
		auth.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal_error"})
		return
	}
	auth.WriteJSON(w, http.StatusOK, listResponse{Certifications: items})
}
