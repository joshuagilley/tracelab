.PHONY: dev api web install build clean compose-up compose-down test sync-sandbox-mongo

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

# $set Concepts.practice from sandbox/<SANDBOX>/ (loads .env if present).
# Example (caching template):
#   make sync-sandbox-mongo SANDBOX=system-design/caching-practice CONCEPT=system-design/caching \
#     ZIP=tracelab-caching-practice.zip FOLDER=caching-practice FILES=go.mod,LAB.md,main.go,main_test.go,solution.go
sync-sandbox-mongo:
	@test -n "$(SANDBOX)" && test -n "$(CONCEPT)" && test -n "$(ZIP)" && test -n "$(FOLDER)" && test -n "$(FILES)" || \
		(echo 'Usage: make sync-sandbox-mongo SANDBOX=<path under sandbox/> CONCEPT=<Concepts _id> ZIP=<zip basename> FOLDER=<dir inside zip> FILES=<comma-separated filenames>'; exit 1)
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && go run ./cmd/sync-sandbox-practice -repo "$(CURDIR)" \
		-sandbox "$(SANDBOX)" -concept "$(CONCEPT)" -zip "$(ZIP)" -folder "$(FOLDER)" -files "$(FILES)"'

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
