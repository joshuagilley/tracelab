.PHONY: dev api web install build clean compose-up compose-down labs-sync

# Copy lab-authored sources into the API embed tree (Go embed must live under services/api).
# Run after editing labs/design-patterns/concepts/** or labs/data-science/concepts/** before building the API.
labs-sync:
	@mkdir -p services/api/internal/labs/embed/design-patterns
	@mkdir -p services/api/internal/labs/embed/data-science
	rsync -a labs/design-patterns/concepts/ services/api/internal/labs/embed/design-patterns/
	rsync -a labs/data-science/concepts/ services/api/internal/labs/embed/data-science/

# Docker: Python playground + Go API (Vite: run `make web` separately)
compose-up:
	docker compose up --build

compose-down:
	docker compose down

dev:
	@echo "Starting TraceLab..."
	@$(MAKE) labs-sync
	@$(MAKE) api & $(MAKE) web

api: labs-sync
	@echo "Starting Go API on :8080"
	cd services/api && go run ./cmd/server

web:
	@echo "Starting Vite dev server on :5173"
	cd apps/web && npm run dev

install:
	cd apps/web && npm install

build: labs-sync
	cd apps/web && npm run build
	cd services/api && go build -o bin/server ./cmd/server

clean:
	rm -rf apps/web/dist
	rm -rf services/api/bin
