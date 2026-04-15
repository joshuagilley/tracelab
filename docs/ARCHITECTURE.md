# Architecture

## Stack

### Frontend (`apps/web`)

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- CSS Modules

### Backend (`services/api`)

- Go 1.25
- Standard `net/http` mux
- MongoDB Go driver
- GitHub OAuth (`golang.org/x/oauth2`)
- JWT sessions

### Data

- MongoDB collections for catalog, users, progress, certifications, and badge email receipts

## Repository structure

```text
tracelab/
  apps/
    web/                      # React SPA
  services/
    api/
      cmd/server/             # API entrypoint
      cmd/seed-certifications # certification metadata seeding (Mongo)
      cmd/lab-tester          # CI: verify reference vs tests (labs/concepts.json)
      internal/
        auth/                 # OAuth/session/user persistence
        catalog/              # lab/concept catalog endpoints
        certifications/       # career track/certification logic
        completed/            # submissions, completion, badge notifier
        labconfig/            # Config collection → per-language GCS filename allowlist
        labstorage/           # GCS reads for gcs-backed practice trees
        practicefiles/        # canonical practice file naming + test picking
        config/               # env/config wiring
        db/                   # mongo connection helpers
        transport/            # route registration
  labs/                       # concepts.json — manifest of practice bundles for lab-tester
  sandbox/                    # local practice sources (when tracked in git)
  docs/                       # project documentation
  .githooks/                  # pre-commit: Go tests + lab-tester + SlopSniff + web build (see README)
```

## Local quality gates

- **`make test`** — `go test ./...` under `services/api`, then **`lab-tester`** (`labs/concepts.json`), then `npm run slopsniff` and `npm run build` under `apps/web` (SlopSniff config: `apps/web/slopsniff.json`).
- **`make install`** — installs web dependencies and sets **`git config core.hooksPath`** to **`.githooks`**, so **`git commit`** (including from Cursor’s Source Control) runs the same sequence as **`.githooks/pre-commit`**, aligned with **`.github/workflows/ci.yml`**. Disable with `git config --unset core.hooksPath` (see `.githooks/README.md`).

## How components connect

1. Web app loads labs via `GET /api/catalog/labs`.
2. User opens a concept; web requests `GET /api/catalog/lesson?lab=<id>&slug=<slug>`.
3. API composes lesson payload from `Labs` + `Concepts` data.
4. Completion/submission flows call `/api/completed` and `/api/completed/submit`. When `GCS_LABS_BUCKET` is set and a concept has `practice.storage: gcs`, canonical files for submit and `GET /api/labs/practice.zip` are read from that bucket instead of embedded Mongo fields. When a concept has `codeFilesStorage: gcs`, `GET /api/catalog/lesson` merges `codeFiles` bodies from `concepts/<_id>/` in the same bucket.
5. Completion writes to `Completed`; badge notifier checks earned certifications and sends email (SMTP), guarded by `BadgeEmails` idempotency receipts.
6. Metrics page aggregates published concept data plus completion language metadata from API responses.

## Filtering model

Curriculum filtering supports:

- `all`: every lab and every concept (published or not)
- `published`: only `status = available` concepts; labs without published concepts are hidden
- `track`: labs marked `all_tracks` plus concepts whose `certification_ids` includes the selected certification `_id` (or `"*"`)
