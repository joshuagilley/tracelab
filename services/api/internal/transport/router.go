package transport

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/tracelab/api/internal/lessons"
)

func NewRouter() http.Handler {
	lessonStore, err := lessons.NewMemoryStore()
	if err != nil {
		log.Fatalf("lessons store: %v", err)
	}
	lessonHandler := lessons.NewHandler(lessonStore)

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "tracelab-api"})
	})

	// GET /api/sections/{lab-id}/concepts[/{slug}] — lab-id matches LabId in the web app
	mux.Handle("/api/sections/", lessonHandler)

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
