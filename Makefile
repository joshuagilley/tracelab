.PHONY: dev api web install build clean compose-up compose-down labs-sync

# Optional: copy data-science Python pins into the API embed tree (reference only; not a codeFile).
# Lesson sources (present/bad) live under services/api/internal/lessons/embed/ — edit there.
labs-sync:
	@mkdir -p services/api/internal/lessons/embed/data-science
	cp labs/data-science/requirements.txt services/api/internal/lessons/embed/data-science/requirements.txt

# Docker: Python playground + Go API (Vite: run `make web` separately)
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
