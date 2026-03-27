package transport

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/tracelab/api/internal/concepts"
	"github.com/tracelab/api/internal/labs"
)

func NewRouter() http.Handler {
	store := concepts.NewMemoryStore()
	h := concepts.NewHandler(store)

	labStore, err := labs.NewMemoryStore()
	if err != nil {
		log.Fatalf("labs store: %v", err)
	}
	labHandler := labs.NewHandler(labStore)

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "tracelab-api"})
	})

	// /api/concepts        → list
	// /api/concepts/{slug} → get by slug
	mux.HandleFunc("/api/concepts/", func(w http.ResponseWriter, r *http.Request) {
		slug := strings.TrimPrefix(r.URL.Path, "/api/concepts/")
		if slug == "" {
			h.List(w, r)
			return
		}
		h.GetBySlug(w, r)
	})

	mux.HandleFunc("/api/concepts", h.List)

	// /api/labs/{design-patterns|data-science}/concepts[/{slug}]
	mux.Handle("/api/labs/", labHandler)

	// Optional proxy to Python datascience container (same origin for browser)
	mux.Handle("/api/datascience/", datascienceProxy())

	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
