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
      cmd/seed-certifications # certification seeding tool
      cmd/sync-sandbox-practice # practice sync tool
      internal/
        auth/                 # OAuth/session/user persistence
        catalog/              # lab/concept catalog endpoints
        certifications/       # career track/certification logic
        completed/            # submissions, completion, badge notifier
        config/               # env/config wiring
        db/                   # mongo connection helpers
        transport/            # route registration
  sandbox/                    # local practice source files for sync
  docs/                       # project documentation
```

## How components connect

1. Web app loads labs via `GET /api/catalog/labs`.
2. User opens a concept; web requests `GET /api/catalog/lesson?lab=<id>&slug=<slug>`.
3. API composes lesson payload from `Labs` + `Concepts` data.
4. Completion/submission flows call `/api/completed` and `/api/completed/submit`.
5. Completion writes to `Completed`; badge notifier checks earned certifications and sends email (SMTP), guarded by `BadgeEmails` idempotency receipts.
6. Metrics page aggregates published concept data plus completion language metadata from API responses.

## Filtering model

Curriculum filtering supports:

- `all`: every lab and every concept (published or not)
- `published`: only `status = available` concepts; labs without published concepts are hidden
- `track`: labs marked `all_tracks` plus tag-matched concepts/labs for selected certification
