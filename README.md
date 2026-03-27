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

## Project Structure

```
tracelab/
  apps/web/          React + TypeScript frontend
  services/api/      Go backend
  context/           Design references
  Makefile
```

## API Routes

| Method | Path                  | Description          |
|--------|-----------------------|----------------------|
| GET    | /health               | Health check         |
| GET    | /api/concepts         | List all concepts    |
| GET    | /api/concepts/:slug   | Get concept by slug  |

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
