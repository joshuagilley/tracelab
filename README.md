# TraceLab

Local development setup for TraceLab.

## Prerequisites

- Go 1.25+
- Node.js 18+
- MongoDB (Atlas or local)

## Environment

Create `.env` at the repository root:

```bash
MONGO_DB_URI=
MONGO_DB_NAME=tracelab
LABS_COLLECTION=Labs
CONCEPTS_COLLECTION=Concepts
CONFIG_COLLECTION=Config
CERTIFICATIONS_COLLECTION=Certifications
USERS_COLLECTION=Users
COMPLETED_COLLECTION=Completed
BADGE_EMAILS_COLLECTION=BadgeEmails

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
OAUTH_CALLBACK_URL=http://localhost:5173/api/auth/github/callback
AUTH_JWT_SECRET=
FRONTEND_ORIGIN=http://localhost:5173
AUTH_COOKIE_CROSS_SITE=false

# Lab practice + lesson codeFiles when concepts use gcs (see docs/MONGO.md).
# Leave empty only if you have no gcs-backed content; otherwise set e.g. tracelab-labs and run:
#   gcloud auth application-default login
GCS_LABS_BUCKET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

## Install and run

```bash
make install
```

`make install` installs web dependencies and **enables `.githooks`** (`git config core.hooksPath`), so **`git commit`** runs Go tests, **`lab-tester`**, SlopSniff, and the web production build before the commit completes (same as CI). To turn that off: `git config --unset core.hooksPath` (see `.githooks/README.md`).

```bash
make dev
```

`make dev` starts the Go API, **waits until `http://127.0.0.1:8080/health` responds**, then starts Vite so the `/api` proxy does not race a slow `go run` compile.

- API runs on `:8080`
- Web runs on `:5173`

Run separately if needed:

```bash
make api
make web
```

Docker (API only):

```bash
make compose-up
make web
```

## Verify

```bash
make test
```

Runs Go tests, then **`lab-tester`** (every bundle in **`labs/concepts.json`**), then **`npm run slopsniff`** and the web production build (see `apps/web/slopsniff.json`). With hooks enabled (default after **`make install`**), **`git commit`** runs the same steps via **`.githooks/pre-commit`**.

## Seed certifications

```bash
make seed-certifications
```

## Documentation

Additional project docs live in `docs/`:

- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/NEW_CONCEPT.md`
- `docs/NEW_LAB.md`
- `docs/MONGO.md`
