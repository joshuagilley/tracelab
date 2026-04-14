# Mongo Collections

Default database name is `tracelab` (`MONGO_DB_NAME`).

Collection names are configurable via env vars; defaults below match code in `services/api/internal/config/config.go`.

## Config (`CONFIG_COLLECTION`, default `Config`)

Optional operational documents keyed by `config_type`.

**`config_type: "labs"`** — expected scaffold filenames per language. When present, the API uses `language_file_structure` to **filter GCS object reads** to those basenames only (skips unrelated objects under the same prefix).

Fields used today:

- `config_type`: `"labs"`
- optional `languages[]` (informational; not read by the allowlist loader)
- `language_file_structure`: map of language id → string array of filenames (e.g. `go` → `["LAB.md","go.mod","main.go",…]`)

If the document is missing or the map is empty, GCS reads behave as before (every object under the prefix).

## Labs (`LABS_COLLECTION`, default `Labs`)

One document per lab section.

Common fields:

- `_id` (lab id, e.g. `system-design`)
- `panelPrefix`
- `title`
- `topics[]` with `id`, `title`, `blurb`, `conceptSlugs[]`
- optional `languages[]`
- optional `defaultOpenSectionIds[]`
- optional `all_tracks: true|false`

Notes:

- `topics[].conceptSlugs` order drives sidebar ordering.
- `all_tracks` allows lab visibility in Track mode for every certification.

## Concepts (`CONCEPTS_COLLECTION`, default `Concepts`)

One document per concept.

Required baseline:

- `_id` = `<labId>/<slug>`
- `labId`, `topicId`, `slug`
- `title`, `summary`, `difficulty`, `status`, `tags`
- `vizType`, `labKind`

Common optional fields:

- `codeFiles[]`
- `metricGroups[]`
- `parameters[]`
- `practice` with `zipName`, `folder`, and optional `languages[]`

**Embedded practice** (default): file bodies live in Mongo.

- `practice.languages[]`: `type` (`Go`, `Python`, …) and `files[]` with `{ name, content }`
- optional top-level `practice.files[]` when there is a single bundle

**GCS-backed practice** (large bundles): set `practice.storage` to `gcs` and **omit** `files` / `languages[].files`.

- `practice.path`: object prefix inside the bucket (e.g. `labs/system-design/caching`)
- optional `practice.bucket` (otherwise the API default from `GCS_LABS_BUCKET` is used)
- `practice.zipName`, `practice.folder` (ZIP layout and download filename)
- `practice.languages[]`: `type` plus optional `pathSegment` (e.g. `go`, `typescript`) so each language maps to `path/pathSegment/` in GCS

The API strips embedded bodies for GCS concepts in lesson JSON; the web app downloads via `GET /api/labs/practice.zip?lab=&slug=&language=`. Submit and server-side checks read the same tree from GCS when `GCS_LABS_BUCKET` is configured.

Object reads are **limited to basenames** listed under `language_file_structure` for that language in the **`Config`** document with `config_type: "labs"` when that document exists; otherwise every object under the prefix is read (legacy behavior).

Grant the Cloud Run API service account **Storage Object Viewer** on the practice bucket (or a tighter custom role) so the server can list and read objects.

GCS-backed concepts should **not** store `practice.files` or `practice.languages[].files` in Mongo (sources live in GCS only).

## Certifications (`CERTIFICATIONS_COLLECTION`, default `Certifications`)

Career track / badge definitions.

Common fields:

- `_id`
- `title`, `role_key`, `description`
- `image_path`
- `track_tags[]`
- `sort_order`
- `active`

Notes:

- `generalist` and `expert` are all-published certifications (no tag restriction).

## Users (`USERS_COLLECTION`, default `Users`)

User profiles from GitHub OAuth.

Fields used in code:

- `_id`
- `github_id` (unique)
- `login`, `name`, `avatar_url`, `email`
- `current_career_track_id`
- `created_at`, `updated_at`

## Completed (`COMPLETED_COLLECTION`, default `Completed`)

One document per `(user_id, lab, slug)` completion.

Fields:

- `user_id`
- `lab`
- `slug`
- `languages[]` (normalized values like `go`, `python`, `typescript`)
- `completed_at`
- `created_at`

Indexes:

- unique on `(user_id, lab, slug)`

## BadgeEmails (`BADGE_EMAILS_COLLECTION`, default `BadgeEmails`)

Idempotency receipts for badge email sending.

Fields:

- `user_id`
- `certification_id`
- `sent_at`

Indexes:

- unique on `(user_id, certification_id)`

## Practical workflow tips

- Keep `Labs` as structure and `Concepts` as detail payload source.
- Use `make sync-sandbox-mongo` for **embedded** practice content updates (sandbox → Mongo).
- Use `make seed-certifications` when track tags/default certs change.
