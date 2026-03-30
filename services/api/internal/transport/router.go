package transport

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/catalog"
	"github.com/tracelab/api/internal/completed"
	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewRouter(cfg *config.Config, mongoClient *mongo.Client) http.Handler {
	mux := http.NewServeMux()
	var conceptsColl *mongo.Collection

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "tracelab-api"})
	})

	// Debug: egress public IP (verify Cloud Run → VPC NAT). Plain text body, e.g. curl .../ip
	mux.HandleFunc("/ip", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.ipify.org", nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write(body)
	})

	mux.HandleFunc("/mongo-probe", mongoProbeHandler(cfg))
	mux.HandleFunc("/mongo-tls-probe", mongoTLSProbeHandler(cfg))

	if mongoClient != nil {
		log.Printf("catalog: registering /api/catalog/* (mongo connected)")
		labsColl := mongoClient.Database(cfg.MongoDBName).Collection(cfg.LabsColl)
		conceptsColl = mongoClient.Database(cfg.MongoDBName).Collection(cfg.ConceptsColl)
		catalog.NewHandler(labsColl, conceptsColl).Register(mux)
	} else {
		log.Printf("catalog: mongoClient is nil — /api/catalog/* serves 503 stubs (see startup mongo: connect log)")
		mux.HandleFunc("/api/catalog/labs", catalogUnavailableLabs)
		mux.HandleFunc("/api/catalog/lesson", catalogUnavailableLesson)
	}

	if cfg.AuthConfigured() && mongoClient != nil {
		coll := mongoClient.Database(cfg.MongoDBName).Collection(cfg.UsersColl)
		store := auth.NewUserStore(coll)
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		if err := store.EnsureIndexes(ctx); err != nil {
			log.Printf("auth: user indexes failed db=%q coll=%q: %v", cfg.MongoDBName, cfg.UsersColl, err)
		}
		cancel()
		auth.NewHandler(cfg, store).Register(mux)

		completedColl := mongoClient.Database(cfg.MongoDBName).Collection(cfg.CompletedColl)
		completedStore := completed.NewStore(completedColl)
		ctx2, cancel2 := context.WithTimeout(context.Background(), 15*time.Second)
		if err := completedStore.EnsureIndexes(ctx2); err != nil {
			log.Printf("completed: indexes failed db=%q coll=%q: %v", cfg.MongoDBName, cfg.CompletedColl, err)
		}
		cancel2()
		completed.NewHandler(cfg, completedStore, conceptsColl).Register(mux)
	} else {
		if !cfg.AuthConfigured() {
			log.Printf("auth: disabled (incomplete env); /api/auth/* stubs")
			auth.MountStub(mux)
		} else {
			log.Printf("auth: disabled (mongo unavailable); /api/auth/* stubs")
			auth.MountStubWithReason(mux, "auth_store_unavailable", auth.HintMongoDown())
		}
	}

	return withCORS(cfg, mux)
}

func withCORS(cfg *config.Config, next http.Handler) http.Handler {
	allowed := cfg.CORSAllowedOrigins()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, o := range allowed {
			if origin == o {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func catalogUnavailableLabs(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	auth.WriteJSON(w, http.StatusServiceUnavailable, map[string]any{
		"error": "mongo_unavailable",
		"labs":  []any{},
	})
}

func catalogUnavailableLesson(w http.ResponseWriter, r *http.Request) {
	if !auth.RequireMethod(w, r, http.MethodGet) {
		return
	}
	auth.WriteJSON(w, http.StatusServiceUnavailable, map[string]string{
		"error": "mongo_unavailable",
	})
}
