# TraceLab `services/`

## `services/api` — Go HTTP API

- **Serves** the web app under one route family: **`GET /api/sections/{system-design|api-design|concurrency|design-patterns|data-science|database-design|cloud-architecture}/concepts`** and **`.../concepts/{slug}`**. Catalog JSON lives in `internal/lessons/data/*.json`; lesson source is embedded from `internal/lessons/embed/{section}/` as **`present.*`** and **`bad.*`** only. Runnable **sandboxes** stay under repo-root **`labs/`**, not in the API image.
- **Proxies** `/api/datascience/*` → optional Python service when `DATASCIENCE_SERVICE_URL` is set (see `internal/transport/datascience_proxy.go`).

## `services/datascience` — optional Python playground

- **Separate** FastAPI app for **real NumPy execution** (e.g. playground endpoints). Not used to store or serve “lesson” source for the TraceLab UI.
- **Why it exists:** production can run static lessons from the Go API only; locally you can `docker compose up` to hit Python through the Go reverse proxy.

## System design

- **Caching** (and other topics) are listed in `internal/lessons/data/system-design.json`. Embedded Go for **Caching** is under `internal/lessons/embed/system-design/caching/`. Optional runnable demos remain in **`labs/system-design/`**.
