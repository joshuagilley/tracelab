package catalog

import (
	"errors"
	"log"
	"net/http"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/labstorage"
)

type Handler struct {
	store *Store
	labs  *labstorage.Service
}

func NewHandler(store *Store, labs *labstorage.Service) *Handler {
	return &Handler{store: store, labs: labs}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/catalog/labs", h.handleLabs)
	mux.HandleFunc("/api/catalog/lesson", h.handleLesson)
	RegisterPracticeZip(mux, h.store, h.labs)
}

// GET /api/catalog/labs → { "labs": [ { ...lab doc... }, ... ] }
func (h *Handler) handleLabs(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	labs, err := h.store.ListLabs(r.Context())
	if err != nil {
		log.Printf("catalog: list labs: %v", err)
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	auth.WriteJSON(w, http.StatusOK, map[string]any{"labs": labs})
}

// GET /api/catalog/lesson?lab=&slug= → merged LabConceptDetail-shaped JSON
func (h *Handler) handleLesson(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	labID := r.URL.Query().Get("lab")
	slug := r.URL.Query().Get("slug")
	if labID == "" || slug == "" {
		writeError(w, http.StatusBadRequest, "lab_and_slug_required")
		return
	}

	lesson, err := h.store.LoadLesson(r.Context(), labID, slug)
	if err != nil {
		switch {
		case errors.Is(err, ErrLabNotFound):
			writeError(w, http.StatusNotFound, "lab_not_found")
		case errors.Is(err, ErrConceptNotInCatalog):
			writeError(w, http.StatusNotFound, "concept_not_in_catalog")
		default:
			log.Printf("catalog: load lesson lab=%q slug=%q: %v", labID, slug, err)
			writeError(w, http.StatusInternalServerError, "internal_error")
		}
		return
	}

	if err := HydrateCodeFilesFromGCS(r.Context(), h.labs, lesson, labID+"/"+slug); err != nil {
		log.Printf("catalog: hydrate codeFiles lab=%q slug=%q: %v", labID, slug, err)
		writeError(w, http.StatusBadGateway, "code_files_unavailable")
		return
	}

	auth.WriteJSON(w, http.StatusOK, lesson)
}
