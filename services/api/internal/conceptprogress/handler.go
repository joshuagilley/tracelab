package conceptprogress

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/config"
)

type Handler struct {
	cfg   *config.Config
	store *Store
}

func NewHandler(cfg *config.Config, store *Store) *Handler {
	return &Handler{cfg: cfg, store: store}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/concepts/progress/lab", h.handleLabProgress)
	mux.HandleFunc("/api/concepts/progress", h.handleProgress)
}

type progressResponse struct {
	CompletedSections []string `json:"completedSections"`
}

type labProgressResponse struct {
	BySlug map[string][]string `json:"bySlug"`
}

type patchBody struct {
	Lab        string `json:"lab"`
	Slug       string `json:"slug"`
	SectionID  string `json:"sectionId"`
	Completed  bool   `json:"completed"`
}

func (h *Handler) handleLabProgress(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	lab := r.URL.Query().Get("lab")
	if lab == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_required"})
		return
	}
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		auth.WriteJSON(w, http.StatusOK, labProgressResponse{BySlug: map[string][]string{}})
		return
	}
	by, err := h.store.AllByUserAndLab(r.Context(), uid, lab)
	if err != nil {
		log.Printf("conceptprogress: lab summary lab=%q: %v", lab, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	if by == nil {
		by = map[string][]string{}
	}
	auth.WriteJSON(w, http.StatusOK, labProgressResponse{BySlug: by})
}

func (h *Handler) handleProgress(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.getProgress(w, r)
	case http.MethodPatch:
		h.patchProgress(w, r)
	default:
		auth.RequireMethods(w, r, http.MethodGet, http.MethodPatch)
	}
}

func (h *Handler) getProgress(w http.ResponseWriter, r *http.Request) {
	lab := r.URL.Query().Get("lab")
	slug := r.URL.Query().Get("slug")
	if lab == "" || slug == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_and_slug_required"})
		return
	}
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		auth.WriteJSON(w, http.StatusOK, progressResponse{CompletedSections: nil})
		return
	}
	list, err := h.store.CompletedSections(r.Context(), uid, lab, slug)
	if err != nil {
		log.Printf("conceptprogress: get lab=%q slug=%q: %v", lab, slug, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	if list == nil {
		list = []string{}
	}
	auth.WriteJSON(w, http.StatusOK, progressResponse{CompletedSections: list})
}

func (h *Handler) patchProgress(w http.ResponseWriter, r *http.Request) {
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		auth.WriteJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var body patchBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_json"})
		return
	}
	if body.Lab == "" || body.Slug == "" || body.SectionID == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_slug_section_required"})
		return
	}
	if err := h.store.SetSection(r.Context(), uid, body.Lab, body.Slug, body.SectionID, body.Completed); err != nil {
		if errors.Is(err, ErrInvalidSectionID) {
			auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_section_id"})
			return
		}
		log.Printf("conceptprogress: patch lab=%q slug=%q section=%q: %v", body.Lab, body.Slug, body.SectionID, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	list, err := h.store.CompletedSections(r.Context(), uid, body.Lab, body.Slug)
	if err != nil {
		log.Printf("conceptprogress: reload after patch: %v", err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	if list == nil {
		list = []string{}
	}
	auth.WriteJSON(w, http.StatusOK, progressResponse{CompletedSections: list})
}