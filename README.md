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
- Go 1.25+ (matches `services/api/go.mod` and the API Dockerfile)
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

Lesson metadata ships as `{lab-id}.json` next to each feature (e.g. `apps/web/src/features/system-design/system-design.json`); `present`/`bad` sources live under `components/…`.

## Sample catalog (per-lab JSON under `apps/web/src/features/<lab>/`)

**System design** (macro): Caching, Load Balancing, Pub/Sub, Sharding, Message Queues, …

**API design** (HTTP surface): Rate Limiting (lesson with middleware sketch), Retries, Circuit Breaker, …
