package transport

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/conceptprogress"
	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewRouter(cfg *config.Config, mongoClient *mongo.Client) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "tracelab-api"})
	})

	if cfg.AuthConfigured() && mongoClient != nil {
		coll := mongoClient.Database(cfg.MongoDBName).Collection(cfg.UsersColl)
		store := auth.NewUserStore(coll)
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		if err := store.EnsureIndexes(ctx); err != nil {
			log.Printf("auth: user indexes failed db=%q coll=%q: %v", cfg.MongoDBName, cfg.UsersColl, err)
		}
		cancel()
		auth.NewHandler(cfg, store).Register(mux)
		progColl := mongoClient.Database(cfg.MongoDBName).Collection(cfg.ConceptsColl)
		progStore := conceptprogress.NewStore(progColl)
		ctx2, cancel2 := context.WithTimeout(context.Background(), 15*time.Second)
		if err := progStore.EnsureIndexes(ctx2); err != nil {
			log.Printf("conceptprogress: indexes failed db=%q coll=%q: %v", cfg.MongoDBName, cfg.ConceptsColl, err)
		}
		cancel2()
		conceptprogress.NewHandler(cfg, progStore).Register(mux)
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
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
