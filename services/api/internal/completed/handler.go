package completed

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	cfg      *config.Config
	store    *Store
	service  *Service
	notifier *BadgeNotifier
}

func NewHandler(
	cfg *config.Config,
	store *Store,
	conceptsColl *mongo.Collection,
	notifier *BadgeNotifier,
) *Handler {
	repo := NewPracticeRepository(conceptsColl)
	runner := NewGoRunner(defaultPracticeRunTimeout)
	svc := NewService(store, repo, runner)
	return &Handler{cfg: cfg, store: store, service: svc, notifier: notifier}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/completed", h.handleCompleted)
	mux.HandleFunc("/api/completed/submit", h.submitLab)
}

type completionStatusResponse struct {
	Completed   bool     `json:"completed"`
	CompletedAt *string  `json:"completedAt"`
	Languages   []string `json:"languages,omitempty"`
}

type labCompletionResponse struct {
	CompletedSlugs []string         `json:"completedSlugs"`
	Completed      []completedEntry `json:"completed,omitempty"`
}

type completedEntry struct {
	Slug      string   `json:"slug"`
	Languages []string `json:"languages,omitempty"`
}

type updateCompletionRequest struct {
	Lab       string `json:"lab"`
	Slug      string `json:"slug"`
	Completed bool   `json:"completed"`
	Language  string `json:"language,omitempty"`
}

type submitPracticeResponse struct {
	Passed      bool     `json:"passed"`
	Completed   bool     `json:"completed"`
	CompletedAt *string  `json:"completedAt"`
	Languages   []string `json:"languages,omitempty"`
	Output      string   `json:"output"`
}

func (h *Handler) handleCompleted(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.getCompleted(w, r)
	case http.MethodPut:
		h.putCompleted(w, r)
	default:
		auth.RequireMethods(w, r, http.MethodGet, http.MethodPut)
	}
}

func writeAnonymousCompletionResponse(w http.ResponseWriter, slug string) {
	if slug != "" {
		auth.WriteJSON(w, http.StatusOK, completionStatusResponse{Completed: false})
		return
	}
	auth.WriteJSON(w, http.StatusOK, labCompletionResponse{CompletedSlugs: []string{}, Completed: []completedEntry{}})
}

// GET /api/completed?lab=<lab>              → { completedSlugs: [...] }
// GET /api/completed?lab=<lab>&slug=<slug>  → { completed: bool, completedAt: string|null }
func (h *Handler) getCompleted(w http.ResponseWriter, r *http.Request) {
	lab := r.URL.Query().Get("lab")
	slug := r.URL.Query().Get("slug")

	if lab == "" {
		writeError(w, http.StatusBadRequest, "lab_required")
		return
	}

	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		writeAnonymousCompletionResponse(w, slug)
		return
	}

	if slug != "" {
		done, completedAt, langs, err := h.store.IsCompleted(r.Context(), uid, lab, slug)
		if err != nil {
			log.Printf("completed.get: lab=%q slug=%q: %v", lab, slug, err)
			writeError(w, http.StatusInternalServerError, "internal_error")
			return
		}
		auth.WriteJSON(w, http.StatusOK, buildStatusResponse(done, completedAt, langs))
		return
	}

	slugs, err := h.store.CompletedSlugs(r.Context(), uid, lab)
	if err != nil {
		log.Printf("completed.list: lab=%q: %v", lab, err)
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	rows, err := h.store.CompletedEntries(r.Context(), uid, lab)
	if err != nil {
		log.Printf("completed.list.entries: lab=%q: %v", lab, err)
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	entries := make([]completedEntry, 0, len(rows))
	for _, row := range rows {
		entries = append(entries, completedEntry{Slug: row.Slug, Languages: row.Languages})
	}
	auth.WriteJSON(w, http.StatusOK, labCompletionResponse{CompletedSlugs: slugs, Completed: entries})
}

// PUT /api/completed  body: { lab, slug, completed: bool }  → completionStatusResponse
func (h *Handler) putCompleted(w http.ResponseWriter, r *http.Request) {
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var body updateCompletionRequest
	if err := decodeJSON(w, r, maxCompletionBodyBytes, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json")
		return
	}
	if body.Lab == "" || body.Slug == "" {
		writeError(w, http.StatusBadRequest, "lab_and_slug_required")
		return
	}

	if body.Completed {
		completedAt, langs, err := h.store.Complete(r.Context(), uid, body.Lab, body.Slug, body.Language)
		if err != nil {
			log.Printf("completed.put mark: lab=%q slug=%q: %v", body.Lab, body.Slug, err)
			writeError(w, http.StatusInternalServerError, "internal_error")
			return
		}
		notifyCtx := context.WithoutCancel(r.Context())
		go h.notifier.NotifyNewlyEarnedBadges(notifyCtx, uid)
		auth.WriteJSON(w, http.StatusOK, buildStatusResponse(true, completedAt, langs))
		return
	}

	if err := h.store.Uncomplete(r.Context(), uid, body.Lab, body.Slug); err != nil {
		log.Printf("completed.put unmark: lab=%q slug=%q: %v", body.Lab, body.Slug, err)
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	auth.WriteJSON(w, http.StatusOK, completionStatusResponse{Completed: false})
}

func buildStatusResponse(done bool, completedAt time.Time, languages []string) completionStatusResponse {
	if !done {
		return completionStatusResponse{Completed: false}
	}
	ts := completedAt.Format(time.RFC3339)
	return completionStatusResponse{Completed: true, CompletedAt: &ts, Languages: languages}
}

func (h *Handler) submitLab(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodPost) {
		return
	}
	uid, err := auth.SessionUserID(h.cfg.JWTSecret, r)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var body SubmitPracticeRequest
	if err := decodeJSON(w, r, maxSubmitBodyBytes, &body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json")
		return
	}

	result, err := h.service.Submit(r.Context(), uid, body)
	if err != nil {
		status, code, doLog := MapSubmitError(err)
		if doLog {
			log.Printf("completed.submit: lab=%q slug=%q: %v", body.Lab, body.Slug, err)
		}
		writeError(w, status, code)
		return
	}

	var completedAt *string
	if result.CompletedAt != nil {
		ts := result.CompletedAt.UTC().Format(time.RFC3339)
		completedAt = &ts
	}
	if result.Completed {
		notifyCtx := context.WithoutCancel(r.Context())
		go h.notifier.NotifyNewlyEarnedBadges(notifyCtx, uid)
	}

	auth.WriteJSON(w, http.StatusOK, submitPracticeResponse{
		Passed:      result.Passed,
		Completed:   result.Completed,
		CompletedAt: completedAt,
		Languages:   result.Languages,
		Output:      result.Output,
	})
}
