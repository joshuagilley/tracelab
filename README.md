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
| Database | MongoDB (users + future progress; see `.env.example`) |

## Running Locally

### Prerequisites
- Go 1.21+
- Node.js 18+

### Quick Start

```bash
# Install frontend dependencies
make install

# Optional: copy .env.example → .env and fill in secrets (Mongo, GitHub OAuth, JWT)
# Start both API and web in parallel
make dev
```

Or run individually:

```bash
make api   # Go API on :8080 — loads repo-root `.env` if present (exports vars for Go)
make web   # Vite dev server on :5173
```

You no longer need to run `set -a && source .env && set +a` by hand; `make api` and `make dev` do that when `.env` exists.

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
| GET | /api/auth/github | Start GitHub OAuth (redirect) |
| GET | /api/auth/github/callback | OAuth callback (redirect + session cookie) |
| GET | /api/auth/me | Current user JSON (`user` or `null`) |
| POST | /api/auth/logout | Clear session |
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
