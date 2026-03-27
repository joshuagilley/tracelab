package transport

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/tracelab/api/internal/concepts"
)

func NewRouter() http.Handler {
	store := concepts.NewMemoryStore()
	h := concepts.NewHandler(store)

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
