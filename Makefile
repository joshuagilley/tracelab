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

# Start API first, wait until /health responds, then Vite (avoids ECONNREFUSED while go run compiles).
dev:
	@echo "Starting TraceLab..."
	@bash -c 'set -e; \
	  if [[ -f "$(CURDIR)/.env" ]]; then set -a && source "$(CURDIR)/.env" && set +a; fi; \
	  cd "$(CURDIR)/services/api" && go run ./cmd/server & \
	  API_PID=$$!; \
	  trap "kill $$API_PID 2>/dev/null; wait $$API_PID 2>/dev/null" EXIT INT TERM; \
	  for i in {1..300}; do \
	    if curl -sf --connect-timeout 1 http://127.0.0.1:8080/health >/dev/null 2>&1; then break; fi; \
	    if ! kill -0 $$API_PID 2>/dev/null; then echo "API exited before listening on :8080"; wait $$API_PID || true; exit 1; fi; \
	    sleep 0.25; \
	  done; \
	  if ! curl -sf --connect-timeout 1 http://127.0.0.1:8080/health >/dev/null; then \
	    echo "Timed out waiting for API on :8080 (first compile can take a while)."; exit 1; \
	  fi; \
	  echo "API on :8080 — starting Vite…"; \
	  cd "$(CURDIR)/apps/web" && npm run dev'

api:
	@echo "Starting Go API on :8080"
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then echo "(loading $(CURDIR)/.env)"; set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && exec go run ./cmd/server'

web:
	@echo "Starting Vite dev server on :5173"
	cd apps/web && npm run dev

install:
	cd apps/web && npm install

build:
	cd apps/web && npm run build
	cd services/api && go build -o bin/server ./cmd/server

test:
	cd services/api && go test ./...
	cd apps/web && npm run build

seed-certifications:
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && go run ./cmd/seed-certifications'

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
