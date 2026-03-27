package main

import (
	"log"
	"net/http"

	"github.com/tracelab/api/internal/config"
	"github.com/tracelab/api/internal/transport"
)

func main() {
	cfg := config.Load()
	router := transport.NewRouter()

	log.Printf("TraceLab API listening on %s", cfg.Addr)
	if err := http.ListenAndServe(cfg.Addr, router); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
