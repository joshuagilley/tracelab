# TraceLab `services/`

## `services/api` — Go HTTP API

- **Serves** the web app under **`GET /api/sections/{lab-id}/concepts`** and **`.../concepts/{slug}`** — `lab-id` matches each TraceLab track (see `validSections` in `internal/lessons/handler.go`). Catalog JSON lives in `internal/lessons/data/*.json`; lesson source is embedded from `internal/lessons/embed/{section}/` as **`present.*`** and **`bad.*`** (and similar per lesson). Runnable **sandboxes** stay under repo-root **`labs/`**, not in the API image.

## System design

- **Caching** (and other topics) are listed in `internal/lessons/data/system-design.json`. Embedded Go for **Caching** is under `internal/lessons/embed/system-design/caching/`. Optional runnable demos remain in **`labs/system-design/`**.
