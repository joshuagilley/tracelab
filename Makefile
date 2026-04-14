.PHONY: dev api web install build clean compose-up compose-down test seed-certifications

# Bash so `api` can `source .env` (GitHub OAuth, Mongo, JWT, etc.)
SHELL := /bin/bash

# Docker: Go API (Vite: run `make web` separately)
compose-up:
	docker compose up --build

compose-down:
	docker compose down

dev-full:
	@echo "Starting Full TraceLab..."
	@$(MAKE) compose-up & $(MAKE) web

# API in background, then Vite once /health is up (avoids Vite proxy racing the first `go run` compile).
dev:
	@bash -c '\
	  if [[ -f "$(CURDIR)/.env" ]]; then set -a && source "$(CURDIR)/.env" && set +a; fi; \
	  (cd "$(CURDIR)/services/api" && exec go run ./cmd/server) & trap "kill $$! 2>/dev/null" EXIT; \
	  n=0; until curl -sf --connect-timeout 1 http://127.0.0.1:8080/health >/dev/null 2>&1; do \
	    sleep 0.25; n=$$((n+1)); [[ $$n -ge 320 ]] && { echo "Timed out waiting for http://127.0.0.1:8080/health"; exit 1; }; \
	  done; \
	  cd "$(CURDIR)/apps/web" && npm run dev'

api:
	@echo "Starting Go API on :8080"
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then echo "(loading $(CURDIR)/.env)"; set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && exec go run ./cmd/server'

web:
	@echo "Starting Vite dev server on :5173"
	cd apps/web && npm run dev

install:
	cd apps/web && npm install
	@git rev-parse --git-dir >/dev/null 2>&1 && git config core.hooksPath "$(CURDIR)/.githooks" && echo "Git hooks enabled: core.hooksPath=$(CURDIR)/.githooks (pre-commit runs CI-equivalent checks)" || true

build:
	cd apps/web && npm run build
	cd services/api && go build -o bin/server ./cmd/server

test:
	cd services/api && go test ./...
	cd apps/web && npm run slopsniff && npm run build

seed-certifications:
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && go run ./cmd/seed-certifications'

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
