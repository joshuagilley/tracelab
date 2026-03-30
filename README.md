<p align="center">
  <img src="assets/logo-v2.png" alt="TraceLab" width="340" />
</p>

# TraceLab

Interactive curriculum UI backed by a Go API and MongoDB. This README covers **local development** and **everything you need to wire a new concept** so it appears in the library, sidebar, and lesson page.

---

## Local development

### Prerequisites

- **Go** 1.25+ (see `services/api/go.mod`)
- **Node.js** 18+
- **MongoDB** reachable from your machine (Atlas or local)

### Environment

Create a **`.env` file at the repository root** (same level as the `Makefile`). The **`make api`** recipe (including when started via **`make dev`**) runs `set -a && source .env` so the Go process sees these variables. The Vite dev server does not read the repo-root `.env` unless you configure it separately.

| Variable | Required for | Purpose |
|----------|----------------|---------|
| `MONGO_DB_URI` | Catalog + auth | Mongo connection string. Without it the API starts but **does not** register `/api/catalog/*` (the app will not load lessons). |
| `MONGO_DB_NAME` | Mongo | Database name (default `tracelab`). |
| `LABS_COLLECTION` | Catalog | Lab catalog documents (default `Labs`). |
| `CONCEPTS_COLLECTION` | Lesson merge | Per-concept detail documents (default `Concepts`). |
| `USERS_COLLECTION` | Auth | Users (default `Users`). |
| `COMPLETED_COLLECTION` | Progress | Completed concepts (default `Completed`). |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Auth | GitHub OAuth. |
| `OAUTH_CALLBACK_URL` | Auth | Registered callback URL (e.g. `http://localhost:5173/api/auth/github/callback` when using the Vite proxy). |
| `AUTH_JWT_SECRET` | Auth | Secret for session JWT. |
| `FRONTEND_ORIGIN` | CORS | SPA origin (default `http://localhost:5173`). |
| `AUTH_COOKIE_CROSS_SITE` | Auth | Set to `true` if API and SPA are on different sites (cookies `SameSite=None; Secure`). |

### Run

```bash
make install    # npm install in apps/web
make dev        # API :8080 + Vite :5173 (sources .env when present)
```

Or separately:

```bash
make api        # Go API on :8080
make web        # Vite on :5173 (proxies `/api` to the API in dev)
```

**Docker (API only):** `make compose-up`, then `make web` for the frontend.

### Repo layout (short)

| Path | Role |
|------|------|
| `apps/web/` | React + Vite SPA |
| `services/api/` | Go HTTP API (`cmd/server`) |
| `labs/` | Optional on-disk examples (e.g. practice lab file trees); not served by the API |

On startup the SPA calls **`GET /api/catalog/labs`**, caches each lab document, then uses **`GET /api/catalog/lesson?lab=&slug=`** for concept detail.

### Tests (curriculum config)

```bash
make test
```

Runs **`go test ./...`** in `services/api` (including `internal/curriculumconfig`) and **`npm test`** in `apps/web`.

Both suites validate **Mongo-shaped JSON** using shared fixtures under **`services/api/internal/curriculumconfig/testdata/`**:

- **`labs/*.json`** — full lab documents: `concepts`, `navSections`, no stray top-level `practice`, matching slugs between nav items and concepts, required concept fields, `labKind` vs `lab._id`, etc.
- **`concepts/*.json`** — Concepts documents: optional `practice` (ZIP shape, safe paths, non-empty `files`, string `content`) and optional `codeFiles` entries.

File names must start with **`ok_`** (expect zero validation errors) or **`err_`** (expect at least one error). Add a new pair when you introduce a new rule.

TypeScript checks reuse the same files and align **`practice` path rules** with `practiceZipEntryPath` in `apps/web/src/lib/practiceZip.ts`.

These tests do **not** connect to Mongo; they guard structure only. To validate a live export, paste documents into temporary `ok_` / `err_` fixtures or run the validators in a REPL.

**GitHub Actions:** `.github/workflows/ci.yml` runs the same Go tests, `npm test`, and `npm run build` on **pull requests** and on **pushes to branches other than `main`**. Pushes to **`main`** run **`.github/workflows/deploy.yml`**, which runs those tests first, then deploys the API and web to Cloud Run.

---

## Adding a new concept

A concept shows “properly” when: (1) it exists in the **Labs** catalog in Mongo, (2) the **sidebar** can link to its `slug`, (3) the **lesson API** returns a merged payload, and (4) the **frontend** knows how to render that lab/slug (layout + optional code tabs + optional practice ZIP).

### 1. MongoDB — `Labs` collection

There is **one document per lab**. Its **`_id`** must match a frontend lab id (e.g. `system-design`, `api-design`, … — the same strings as in `apps/web/src/contexts/lab.tsx`).

That document should include:

- **`concepts`** — array of concept rows (library cards + base lesson metadata).
- **`navSections`** — sidebar structure. Any item with a **`slug`** becomes a link to `/concept/<slug>` for the current lab.
- **`panelPrefix`**, and optionally **`languages`**, **`defaultOpenSectionIds`**, etc., as you already use for other labs.

Each entry in **`concepts`** should include at least what the UI expects on the list and detail request (see `apps/web/src/features/lessons/labCatalogTypes.ts` and `apps/web/src/types/concept.ts`):

| Field | Notes |
|-------|--------|
| `id` | Stable string (often the same as `slug` if you do not need a separate key). |
| `slug` | URL segment; **must be unique within the lab** and must match `navSections[].items[].slug` when you want a sidebar link. |
| `title`, `summary`, `difficulty`, `tags`, `status` | `status`: `available` or `coming-soon`. |
| `labKind` | Usually the lab id string (e.g. `system-design`). |
| `vizType` | Frontend uses this with `labId` to pick a layout in `ConceptDetailPage`. |
| `codeFiles` | Array of `{ "name", "lang" }` for tab labels. Actual source text usually comes from the **Concepts** document (next step). |

After inserting or editing the lab document, restart or refresh the app so **`fetchLabsCatalogIntoCache`** runs again (full page load).

### 2. MongoDB — `Concepts` collection (detail merge)

Optional for a bare listing, but you need it for **filled code tabs**, **practice ZIP**, and other detail-only fields.

- **`_id`**: **`"<labId>/<slug>"`** (e.g. `system-design/caching`). The API builds this when loading a lesson.
- Fields on this document are **merged on top of** the matching row from `Labs.concepts`. The API does not copy `_id`, `lab`, or `slug` from the Concepts document into the response.
- **`codeFiles`**: Same file **names** as in the lab row; each object can include **`code`** (and optional **`role`**: `present` | `bad` | `exercise`). If the Concepts doc has no `codeFiles`, the API still returns tabs but with **empty** `code` strings shaped from the lab row’s names.

**Practice download** — on the same Concepts document, optional **`practice`**:

```json
{
  "zipName": "my-lab.zip",
  "folder": "my-lab",
  "files": [
    { "name": "README.md", "content": "..." },
    { "name": "pkg/stub.go", "content": "..." }
  ]
}
```

Use normal subpaths in `name` (no `.` or `..` segments). Reference tree: `labs/system-design/caching-practice/`. Client build: `apps/web/src/lib/practiceZip.ts`.

### 3. Frontend — routing and UI

All of this lives under **`apps/web/src/features/concepts/`** and related lesson modules.

1. **`ConceptDetailPage.tsx`**  
   Your **`labId`** + **`vizType`** and/or **`slug`** must hit an existing branch: lesson panel + visualizer, not the generic “layout is not available yet” path (see **`LABS_AWAITING_LESSON_UI`** in that file). Until that branch exists, the catalog can list the concept but the detail page will look broken or wrong.

2. **Code panel source files** (when you want non-empty tabs)  
   - Add raw files under `apps/web/src/components/…` (follow existing lessons).  
   - Register them in **`apps/web/src/features/lessons/lessonSourceRegistry.ts`** with **`?raw`** imports.  
   - Keys must match the **`name`** values in `codeFiles` from Mongo.

3. **Optional: “mark done” / sidebar completion**  
   If this lab should participate in whole-concept progress, update **`apps/web/src/features/concepts/conceptSectionExpectations.ts`** (`LABS_WITH_WHOLE_CONCEPT_PROGRESS`).

### 4. Quick verification

1. Open the app, select the lab, confirm the concept appears in the **library**.  
2. Open the **sidebar** link (item must have **`slug`** set).  
3. Confirm **`/api/catalog/lesson?lab=…&slug=…`** returns JSON with the fields you expect (`codeFiles`, `practice`, etc.).  
4. Confirm the **detail page** shows the correct lesson layout and code/practice behavior.

---

## API routes (reference)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/api/catalog/labs` | All lab catalog documents (drives library + sidebar cache) |
| GET | `/api/catalog/lesson?lab=&slug=` | Merged lesson for one concept |
| GET/POST | `/api/auth/*` | GitHub OAuth + session (when auth env is complete) |
