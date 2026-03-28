<p align="center">
  <img src="assets/logo-v2.png" alt="TraceLab" width="340" />
</p>

# TraceLab

> **Live:** [tracelab-web-1033528334340.us-east1.run.app](https://tracelab-web-1033528334340.us-east1.run.app/concept/caching)

A lightweight interactive learning tool for system design concepts.

## Stack

| Layer    | Tech                    |
|----------|-------------------------|
| Frontend | React + TypeScript + Vite |
| Backend  | Go (net/http)           |
| Data Science (playground) | Python 3.12 + FastAPI + NumPy (optional service) |
| Database | MongoDB (optional, not wired yet) |

## Running Locally

### Prerequisites
- Go 1.21+
- Node.js 18+

### Quick Start

```bash
# Install frontend dependencies
make install

# Start both API and web in parallel
make dev
```

Or run individually:

```bash
make api   # Go API on :8080
make web   # Vite dev server on :5173
```

**Full stack with Python playground** (Go proxies `/api/datascience/*` → FastAPI, avoids CORS):

```bash
make compose-up   # datascience :8090, api :8080 — then run `make web`
```

Unset `DATASCIENCE_SERVICE_URL` on the Go process to disable the proxy (static Data Science lessons still work from embedded JSON).

## Project Structure

```
tracelab/
  apps/web/              React + TypeScript frontend
  labs/                  Local sandboxes + system-design code (see labs/CONCEPT.md)
  services/api/          Go backend + embedded lesson files (present/bad/notes) + optional DS proxy
  services/datascience/   FastAPI + NumPy (local / Cloud Run playground)
  docker-compose.yml
  context/               Design references
  Makefile
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /api/sections/system-design/concepts | System design — list |
| GET | /api/sections/system-design/concepts/:slug | System design — detail (embedded present/bad) |
| GET | /api/sections/design-patterns/concepts | Design patterns — list |
| GET | /api/sections/design-patterns/concepts/:slug | Singleton, DI, etc. |
| GET | /api/sections/data-science/concepts | Data science — list |
| GET | /api/sections/data-science/concepts/:slug | Numerical Computing, etc. |
| GET | /api/datascience/* | Proxied to Python service when `DATASCIENCE_SERVICE_URL` is set |

## Concepts

| Concept        | Difficulty | Status      |
|----------------|------------|-------------|
| Caching        | Easy       | Available   |
| Rate Limiting  | Medium     | Available   |
| Load Balancing | Medium     | Available   |
| Retries        | Easy       | Coming Soon |
| Circuit Breaker| Medium     | Coming Soon |
| Pub/Sub        | Medium     | Coming Soon |
| Sharding       | Hard       | Coming Soon |
| Queues         | Medium     | Coming Soon |
