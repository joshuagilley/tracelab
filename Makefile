.PHONY: dev api web install build clean compose-up compose-down labs-sync test

# Bash so `api` can `source .env` (GitHub OAuth, Mongo, JWT, etc.)
SHELL := /bin/bash

# Optional: copy data-science Python pins next to the numerical-computing lesson sources in the web app.
labs-sync:
	@mkdir -p apps/web/src/components/data-science/numerical-computing/numerical-computing
	cp labs/data-science/requirements.txt apps/web/src/components/data-science/numerical-computing/numerical-computing/requirements.txt

# Docker: Go API (Vite: run `make web` separately)
compose-up:
	docker compose up --build

compose-down:
	docker compose down

dev-full:
	@echo "Starting Full TraceLab..."
	@$(MAKE) labs-sync
	@$(MAKE) compose-up & $(MAKE) web

dev:
	@echo "Starting TraceLab..."
	@$(MAKE) labs-sync
	@$(MAKE) api & $(MAKE) web

api: labs-sync
	@echo "Starting Go API on :8080"
	@bash -c 'if [[ -f "$(CURDIR)/.env" ]]; then echo "(loading $(CURDIR)/.env)"; set -a && source "$(CURDIR)/.env" && set +a; fi; cd "$(CURDIR)/services/api" && exec go run ./cmd/server'

web:
	@echo "Starting Vite dev server on :5173"
	cd apps/web && npm run dev

install:
	cd apps/web && npm install

build: labs-sync
	cd apps/web && npm run build
	cd services/api && go build -o bin/server ./cmd/server

test:
	cd services/api && go test ./...
	cd apps/web && npm test

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
