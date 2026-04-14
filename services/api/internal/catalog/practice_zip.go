package catalog

import (
	"archive/zip"
	"context"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/labstorage"
)

// RegisterPracticeZip serves GET /api/labs/practice.zip when GCS lab storage is enabled.
func RegisterPracticeZip(mux *http.ServeMux, store *Store, labs *labstorage.Service) {
	if labs == nil || !labs.Enabled() {
		return
	}
	h := &practiceZipHandler{store: store, labs: labs}
	mux.HandleFunc("/api/labs/practice.zip", h.handle)
}

type practiceZipHandler struct {
	store *Store
	labs  *labstorage.Service
}

func (h *practiceZipHandler) handle(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	if h.store == nil || h.labs == nil || !h.labs.Enabled() {
		writeError(w, http.StatusServiceUnavailable, "labs_gcs_unavailable")
		return
	}
	labID := strings.TrimSpace(r.URL.Query().Get("lab"))
	slug := strings.TrimSpace(r.URL.Query().Get("slug"))
	lang := strings.TrimSpace(r.URL.Query().Get("language"))
	if labID == "" || slug == "" {
		writeError(w, http.StatusBadRequest, "lab_and_slug_required")
		return
	}
	if lang == "" {
		lang = "go"
	}

	practice, err := h.store.RawConceptPractice(r.Context(), labID, slug)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			writeError(w, http.StatusNotFound, "concept_not_found")
			return
		}
		log.Printf("labs.zip: load practice lab=%q slug=%q: %v", labID, slug, err)
		writeError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	if practice == nil {
		writeError(w, http.StatusNotFound, "practice_not_found")
		return
	}
	st, _ := practice["storage"].(string)
	if !strings.EqualFold(strings.TrimSpace(st), "gcs") {
		writeError(w, http.StatusNotFound, "practice_not_gcs")
		return
	}

	files, err := h.labs.ReadPracticeFiles(r.Context(), practice, lang)
	if err != nil {
		log.Printf("labs.zip: gcs read lab=%q slug=%q: %v", labID, slug, err)
		writeError(w, http.StatusNotFound, "practice_bundle_unavailable")
		return
	}

	folder, _ := practice["folder"].(string)
	folder = strings.Trim(strings.TrimSpace(folder), "/")
	if folder == "" || strings.Contains(folder, "..") {
		writeError(w, http.StatusInternalServerError, "invalid_practice_folder")
		return
	}
	zipName, _ := practice["zipName"].(string)
	if strings.TrimSpace(zipName) == "" {
		zipName = "tracelab-lab.zip"
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="`+zipName+`"`)
	zw := zip.NewWriter(w)
	for _, f := range files {
		name := f.Name
		if strings.Contains(name, "..") {
			continue
		}
		name = strings.TrimPrefix(strings.ReplaceAll(name, "\\", "/"), "/")
		entry := folder + "/" + name
		wr, err := zw.Create(entry)
		if err != nil {
			log.Printf("labs.zip: zip create %q: %v", entry, err)
			continue
		}
		if _, err := io.WriteString(wr, f.Content); err != nil {
			log.Printf("labs.zip: write %q: %v", entry, err)
		}
	}
	if err := zw.Close(); err != nil {
		log.Printf("labs.zip: close zip: %v", err)
	}
}

// RawConceptPractice returns the practice subdocument for a concept (for GCS zip and submit).
func (s *Store) RawConceptPractice(ctx context.Context, labID, slug string) (bson.M, error) {
	conceptID := labID + "/" + slug
	var doc bson.M
	if err := s.concepts.FindOne(ctx, bson.M{"_id": conceptID}).Decode(&doc); err != nil {
		return nil, err
	}
	raw, ok := doc["practice"].(bson.M)
	if !ok || raw == nil {
		return nil, mongo.ErrNoDocuments
	}
	return raw, nil
}
