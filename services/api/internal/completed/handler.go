package completed

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	cfg          *config.Config
	store        *Store
	conceptsColl *mongo.Collection
}

func NewHandler(cfg *config.Config, store *Store, conceptsColl *mongo.Collection) *Handler {
	return &Handler{cfg: cfg, store: store, conceptsColl: conceptsColl}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/completed", h.handle)
	mux.HandleFunc("/api/completed/submit", h.submitLab)
}

// statusResponse is returned for single-concept queries and after PUT.
type statusResponse struct {
	Completed   bool    `json:"completed"`
	CompletedAt *string `json:"completedAt"` // RFC3339 or null
}

// labResponse is returned when only lab is provided.
type labResponse struct {
	CompletedSlugs []string `json:"completedSlugs"`
}

type putBody struct {
	Lab       string `json:"lab"`
	Slug      string `json:"slug"`
	Completed bool   `json:"completed"`
}

func (h *Handler) handle(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.getCompleted(w, r)
	case http.MethodPut:
		h.putCompleted(w, r)
	default:
		auth.RequireMethods(w, r, http.MethodGet, http.MethodPut)
	}
}

// GET /api/completed?lab=<lab>              → { completedSlugs: [...] }
// GET /api/completed?lab=<lab>&slug=<slug>  → { completed: bool, completedAt: string|null }
func (h *Handler) getCompleted(w http.ResponseWriter, r *http.Request) {
	lab := r.URL.Query().Get("lab")
	slug := r.URL.Query().Get("slug")

	if lab == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_required"})
		return
	}

	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		// Unauthenticated: return empty results without an error.
		if slug != "" {
			auth.WriteJSON(w, http.StatusOK, statusResponse{Completed: false})
		} else {
			auth.WriteJSON(w, http.StatusOK, labResponse{CompletedSlugs: []string{}})
		}
		return
	}

	if slug != "" {
		done, completedAt, err := h.store.IsCompleted(r.Context(), uid, lab, slug)
		if err != nil {
			log.Printf("completed: get lab=%q slug=%q: %v", lab, slug, err)
			http.Error(w, "db", http.StatusInternalServerError)
			return
		}
		auth.WriteJSON(w, http.StatusOK, buildStatusResponse(done, completedAt))
		return
	}

	slugs, err := h.store.CompletedSlugs(r.Context(), uid, lab)
	if err != nil {
		log.Printf("completed: list lab=%q: %v", lab, err)
		http.Error(w, "db", http.StatusInternalServerError)
		return
	}
	auth.WriteJSON(w, http.StatusOK, labResponse{CompletedSlugs: slugs})
}

// PUT /api/completed  body: { lab, slug, completed: bool }  → statusResponse
func (h *Handler) putCompleted(w http.ResponseWriter, r *http.Request) {
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		auth.WriteJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var body putBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_json"})
		return
	}
	if body.Lab == "" || body.Slug == "" {
		auth.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "lab_and_slug_required"})
		return
	}

	if body.Completed {
		completedAt, err := h.store.Complete(r.Context(), uid, body.Lab, body.Slug)
		if err != nil {
			log.Printf("completed: mark done lab=%q slug=%q: %v", body.Lab, body.Slug, err)
			http.Error(w, "db", http.StatusInternalServerError)
			return
		}
		auth.WriteJSON(w, http.StatusOK, buildStatusResponse(true, completedAt))
	} else {
		if err := h.store.Uncomplete(r.Context(), uid, body.Lab, body.Slug); err != nil {
			log.Printf("completed: unmark lab=%q slug=%q: %v", body.Lab, body.Slug, err)
			http.Error(w, "db", http.StatusInternalServerError)
			return
		}
		auth.WriteJSON(w, http.StatusOK, statusResponse{Completed: false})
	}
}

func buildStatusResponse(done bool, completedAt time.Time) statusResponse {
	if !done {
		return statusResponse{Completed: false}
	}
	ts := completedAt.Format(time.RFC3339)
	return statusResponse{Completed: true, CompletedAt: &ts}
}
