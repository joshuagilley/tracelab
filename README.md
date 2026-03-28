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

**Docker (API only)** — then run `make web` for Vite:

```bash
make compose-up   # api :8080
```

## Project Structure

```
tracelab/
  apps/web/              React + TypeScript frontend
  labs/                  Local sandboxes + system-design code (see labs/CONCEPT.md)
  services/api/          Go backend + embedded lesson files (present/bad/notes)
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
| GET | /api/sections/api-design/concepts | API design — list |
| GET | /api/sections/api-design/concepts/:slug | Rate limits, retries, circuit breaker at HTTP boundary |
| GET | /api/sections/concurrency/concepts | Concurrency — list (in-process execution curriculum) |
| GET | /api/sections/concurrency/concepts/:slug | Goroutines, pools, channels (lessons as added) |
| GET | /api/sections/design-patterns/concepts | Design patterns — list |
| GET | /api/sections/design-patterns/concepts/:slug | Singleton, DI, etc. |
| GET | /api/sections/data-science/concepts | Data science — list |
| GET | /api/sections/data-science/concepts/:slug | Numerical Computing, etc. |
| GET | /api/sections/database-design/concepts | Database design — list |
| GET | /api/sections/database-design/concepts/:slug | Embedded present/bad (Go DDL strings) |
| GET | /api/sections/cloud-architecture/concepts | Cloud architecture — list |
| GET | /api/sections/cloud-architecture/concepts/:slug | VPC, S3, SQS, Lambda, etc. |

## Sample catalog (see JSON under `services/api/internal/lessons/data/`)

**System design** (macro): Caching, Load Balancing, Pub/Sub, Sharding, Message Queues, …

**API design** (HTTP surface): Rate Limiting (lesson with middleware sketch), Retries, Circuit Breaker, …
