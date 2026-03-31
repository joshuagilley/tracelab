# Mongo Collections

Default database name is `tracelab` (`MONGO_DB_NAME`).

Collection names are configurable via env vars; defaults below match code in `services/api/internal/config/config.go`.

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
- `practice` with `zipName`, `folder`, and `languages[]`

`practice.languages[]` shape:

- `type` (`Go`, `Python`, `TypeScript`, etc.)
- `files[]` with `{ name, content }`

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
- Use `make sync-sandbox-mongo` for practice content updates.
- Use `make seed-certifications` when track tags/default certs change.
