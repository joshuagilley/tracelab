.PHONY: dev api web install build clean compose-up compose-down test sync-caching-mongo

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

dev:
	@echo "Starting TraceLab..."
	@$(MAKE) api & $(MAKE) web

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

# $set Concepts.practice for system-design/caching from sandbox/system-design/caching-practice/
sync-caching-mongo:
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && go run ./cmd/sync-caching-practice -repo "$(CURDIR)"'

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
