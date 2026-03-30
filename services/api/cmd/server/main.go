package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/tracelab/api/internal/config"
	"github.com/tracelab/api/internal/db"
	"github.com/tracelab/api/internal/transport"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	mongoConnectTimeout    = 30 * time.Second
	mongoDisconnectTimeout = 5 * time.Second
	serverShutdownTimeout  = 10 * time.Second
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg := config.Load()
	cfg.LogAuthEnvDiagnostics()

	mongoClient := connectMongo(cfg)
	if mongoClient != nil {
		defer disconnectMongo(mongoClient)
	}

	router := transport.NewRouter(cfg, mongoClient)

	srv := &http.Server{
		Addr:    cfg.Addr,
		Handler: router,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("TraceLab API listening on %s", cfg.Addr)
		err := srv.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
			return
		}
		serverErr <- nil
	}()

	select {
	case err := <-serverErr:
		if err != nil {
			return fmt.Errorf("server: %w", err)
		}
	case <-ctx.Done():
		log.Printf("shutting down")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), serverShutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("server shutdown: %w", err)
	}
	return nil
}

func connectMongo(cfg *config.Config) *mongo.Client {
	if cfg.MongoURI == "" {
		log.Printf("mongo: MONGO_DB_URI not set; auth persistence disabled")
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), mongoConnectTimeout)
	defer cancel()

	client, err := db.Connect(ctx, cfg.MongoURI)
	if err != nil {
		log.Printf("mongo: connect failed (auth store offline): %v", err)
		return nil
	}

	log.Printf(
		"mongo: connected (db=%q users=%q completed=%q labs=%q concepts=%q)",
		cfg.MongoDBName,
		cfg.UsersColl,
		cfg.CompletedColl,
		cfg.LabsColl,
		cfg.ConceptsColl,
	)

	return client
}

func disconnectMongo(client *mongo.Client) {
	ctx, cancel := context.WithTimeout(context.Background(), mongoDisconnectTimeout)
	defer cancel()

	if err := client.Disconnect(ctx); err != nil {
		log.Printf("mongo: disconnect failed: %v", err)
	}
}
