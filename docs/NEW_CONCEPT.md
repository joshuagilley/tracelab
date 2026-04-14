# Add a New Concept

This guide is the operational checklist for adding one concept end-to-end.

Also review `.cursor/rules/new-concept.mdc` before starting; it captures the preferred workflow and quality bar used in this repo.

## 1) Decide identifiers first

Choose and keep these consistent:

- `labId` (existing lab id, e.g. `system-design`)
- `slug` (URL + registry key, e.g. `caching`)
- `topicId` (topic bucket inside the lab)
- `Concepts._id` (`<labId>/<slug>`)

## 2) Add sandbox practice files

Create language folders under `sandbox/<lab>/<topic>/`:

- `go/`
- `python/`
- `typescript/`

Each language bundle should include:

- `LAB.md`
- starter (`main.go` / `main.py` / `main.ts`)
- tests (`main_test.go` / `test_main.py` / `main.test.ts`)
- optional reference solution (`solution.go` / `solution.py` / `solution.ts`)
- for Go, include `go.mod`

## 3) Add/update Mongo concept document (`Concepts`)

Required baseline fields:

- `_id`, `labId`, `topicId`, `slug`
- `title`, `summary`, `difficulty`, `status`, `tags`
- `vizType` (`lesson` or simulation key)
- `labKind`

Optional but common:

- `codeFiles` (read-only implementation panel files)
- `metricGroups` (metrics panel definitions)
- `parameters` (sim controls)
- `practice` bundle metadata

Multi-language practice shape:

```json
"practice": {
  "zipName": "tracelab-example-practice.zip",
  "folder": "example-practice",
  "languages": [
    { "type": "Go", "files": [{ "name": "main.go", "content": "..." }] },
    { "type": "Python", "files": [{ "name": "main.py", "content": "..." }] },
    { "type": "TypeScript", "files": [{ "name": "main.ts", "content": "..." }] }
  ]
}
```

## 4) Ensure lab topic includes the concept slug

In the `Labs` document for the lab, make sure `topics[].conceptSlugs` contains your new `slug` under the correct `topicId`.

If this concept should show for all career tracks in Track mode, use `all_tracks` on the lab where appropriate.

## 5) Wire frontend rendering

For text lessons:

1. Add lesson component in `apps/web/src/components/lessons/<lab>/`.
2. Register `slug -> component` in `apps/web/src/features/curriculum/lesson-registry.ts`.

For simulations:

1. Add simulation component.
2. Register adapter in `apps/web/src/lib/simulation-registry/`.
3. Ensure `vizType` matches the registry key.

## 6) Sync practice files to Mongo

**Embedded practice** (files stored on the concept): use the sync command:

```bash
make sync-sandbox-mongo \
  SANDBOX=<path-under-sandbox> \
  CONCEPT=<labId/slug> \
  ZIP=<zip-name> \
  FOLDER=<folder-inside-zip> \
  FILES=<comma-separated-files>
```

**GCS-backed practice** (`practice.storage: "gcs"`, sources in the bucket): put objects under `practice.path` / language segments; set slim `languages` metadata in Mongo (no embedded `files` on the concept).

**GCS-backed lesson `codeFiles`:** set `codeFilesStorage: gcs`, `codeFilesPath` (`concepts/<_id>`), and objects in the bucket (`good.go`, `bad.go`, …). The **`codeFiles`** array on the concept is optional; the API can build the lesson from GCS object listing (see `docs/MONGO.md`).

## 7) Career certifications (`certification_ids`)

Set **`certification_ids`** on the `Concepts` document to certification `_id` strings (e.g. `backend-engineer`, `software-engineer`). Track mode and badge eligibility use **only** this field (not `tags`). Use **`"*"`** in the array when the concept should appear for **every** career certification.

One-time migration from the old tag overlap model:

```bash
make backfill-concept-certification-ids
```

Then keep certification **metadata** (titles, descriptions, sort order) in sync when defaults change:

```bash
make seed-certifications
```

## 8) Validate

- Concept appears in library and sidebar.
- Lesson route renders correctly.
- Practice ZIP downloads in each language.
- Submission runs and completion persists.
- Metrics page reflects completion and language icons.
