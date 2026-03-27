.PHONY: dev api web install build clean compose-up compose-down

# Docker: Python playground + Go API (Vite: run `make web` separately)
compose-up:
	docker compose up --build

compose-down:
	docker compose down

dev:
	@echo "Starting TraceLab..."
	@$(MAKE) api & $(MAKE) web

api:
	@echo "Starting Go API on :8080"
	cd services/api && go run ./cmd/server

web:
	@echo "Starting Vite dev server on :5173"
	cd apps/web && npm run dev

install:
	cd apps/web && npm install

build:
	cd apps/web && npm run build
	cd services/api && go build -o bin/server ./cmd/server

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
