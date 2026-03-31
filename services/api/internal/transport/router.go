package transport

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/tracelab/api/internal/auth"
	"github.com/tracelab/api/internal/catalog"
	"github.com/tracelab/api/internal/completed"
	"github.com/tracelab/api/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
)

const indexEnsureTimeout = 15 * time.Second

func NewRouter(cfg *config.Config, mongoClient *mongo.Client) http.Handler {
	mux := http.NewServeMux()
	registerHealth(mux)

	if mongoClient == nil {
		registerCatalogUnavailableRoutes(mux)
		registerAuthFallbackRoutes(mux, cfg, false)
		return withCORS(cfg, mux)
	}

	db := mongoClient.Database(cfg.MongoDBName)
	labsColl := db.Collection(cfg.LabsColl)
	conceptsColl := db.Collection(cfg.ConceptsColl)
	usersColl := db.Collection(cfg.UsersColl)
	completedColl := db.Collection(cfg.CompletedColl)

	registerCatalogRoutes(mux, labsColl, conceptsColl)

	if cfg.AuthConfigured() {
		registerAuthRoutes(mux, cfg, usersColl)
		registerCompletedRoutes(mux, cfg, completedColl, conceptsColl)
	} else {
		registerAuthFallbackRoutes(mux, cfg, true)
	}

	return withCORS(cfg, mux)
}

func registerHealth(mux *http.ServeMux) {
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		auth.WriteJSON(w, http.StatusOK, map[string]string{
			"status":  "ok",
			"service": "tracelab-api",
		})
	})
}

func registerCatalogRoutes(mux *http.ServeMux, labsColl, conceptsColl *mongo.Collection) {
	catalog.NewHandler(catalog.NewStore(labsColl, conceptsColl)).Register(mux)
}

func registerCatalogUnavailableRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/catalog/labs", catalogUnavailableLabs)
	mux.HandleFunc("/api/catalog/lesson", catalogUnavailableLesson)
}

func registerAuthRoutes(mux *http.ServeMux, cfg *config.Config, usersColl *mongo.Collection) {
	store := auth.NewUserStore(usersColl)
	ensureIndexes("auth", cfg.MongoDBName, cfg.UsersColl, store.EnsureIndexes)
	auth.NewHandler(cfg, store).Register(mux)
}

func registerCompletedRoutes(
	mux *http.ServeMux,
	cfg *config.Config,
	completedColl, conceptsColl *mongo.Collection,
) {
	store := completed.NewStore(completedColl)
	ensureIndexes("completed", cfg.MongoDBName, cfg.CompletedColl, store.EnsureIndexes)
	completed.NewHandler(cfg, store, conceptsColl).Register(mux)
}

// registerAuthFallbackRoutes mounts auth stubs when full auth is not active.
// mongoAvailable is false when the process has no Mongo client (catalog/auth store down).
func registerAuthFallbackRoutes(mux *http.ServeMux, cfg *config.Config, mongoAvailable bool) {
	if !cfg.AuthConfigured() {
		log.Printf("auth: disabled (incomplete env); /api/auth/* stubs")
		auth.MountStub(mux)
		return
	}
	if !mongoAvailable {
		log.Printf("auth: disabled (mongo unavailable); /api/auth/* stubs")
		auth.MountStubWithReason(mux, "auth_store_unavailable", auth.HintMongoDown())
	}
}

func ensureIndexes(component, dbName, collName string, fn func(context.Context) error) {
	ctx, cancel := context.WithTimeout(context.Background(), indexEnsureTimeout)
	defer cancel()
	if err := fn(ctx); err != nil {
		log.Printf("%s: indexes failed db=%q coll=%q: %v", component, dbName, collName, err)
	}
}

func withCORS(cfg *config.Config, next http.Handler) http.Handler {
	allowedOrigins := make(map[string]struct{}, len(cfg.CORSAllowedOrigins()))
	for _, o := range cfg.CORSAllowedOrigins() {
		allowedOrigins[o] = struct{}{}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Vary", "Origin")

		origin := r.Header.Get("Origin")
		if _, ok := allowedOrigins[origin]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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
