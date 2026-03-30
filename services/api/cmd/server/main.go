package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/tracelab/api/internal/config"
	"github.com/tracelab/api/internal/db"
	"github.com/tracelab/api/internal/transport"
	"go.mongodb.org/mongo-driver/mongo"
)

func main() {
	cfg := config.Load()
	cfg.LogAuthEnvDiagnostics()

	var mongoClient *mongo.Client
	if cfg.MongoURI != "" {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		c, err := db.Connect(ctx, cfg.MongoURI)
		cancel()
		if err != nil {
			log.Printf("mongo: connect failed (auth store offline): %v", err)
		} else {
			mongoClient = c
			defer func() {
				ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
				_ = mongoClient.Disconnect(ctx)
				cancel()
			}()
			log.Printf("mongo: connected (db=%q users=%q completed=%q labs=%q concepts=%q)",
				cfg.MongoDBName, cfg.UsersColl, cfg.CompletedColl, cfg.LabsColl, cfg.ConceptsColl)
		}
	} else {
		log.Printf("mongo: MONGO_DB_URI not set; auth persistence disabled")
	}

	router := transport.NewRouter(cfg, mongoClient)

	go func() {
		log.Printf("TraceLab API listening on %s", cfg.Addr)
		if err := http.ListenAndServe(cfg.Addr, router); err != nil {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Printf("shutting down")
}
