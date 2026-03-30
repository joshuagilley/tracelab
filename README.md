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
| `sandbox/` | **Dev-only** practice code (see `sandbox/README.md`). Not imported by the app or API. |

On startup the SPA calls **`GET /api/catalog/labs`**, caches each lab document, then uses **`GET /api/catalog/lesson?lab=&slug=`** for concept detail.

### Tests

```bash
make test
```

Runs **`go test ./...`** in `services/api` and **`npm run build`** in `apps/web` (TypeScript + Vite).

**GitHub Actions:** `.github/workflows/ci.yml` runs the same Go tests and web build on **pull requests** and on **pushes to branches other than `main`**. Pushes to **`main`** run **`.github/workflows/deploy.yml`**, which runs those checks first, then deploys the API and web to Cloud Run.

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
| `vizType` | How the detail page renders: `"lesson"` for a **text lesson** (must register **`slug`** in `lessonRegistry.ts` — see §3 below), or a simulation key (e.g. `caching`) registered in `vizRegistry.tsx`. |
| `codeFiles` | Array of `{ "name", "lang" }` for tab labels. Actual source text usually comes from the **Concepts** document (next step). |

After inserting or editing the lab document, restart or refresh the app so **`fetchLabsCatalogIntoCache`** runs again (full page load).

### 2. MongoDB — `Concepts` collection (detail merge)

Optional for a bare listing, but you need it for **filled code tabs**, **practice ZIP**, and other detail-only fields.

- **`_id`**: **`"<labId>/<slug>"`** (e.g. `system-design/caching`). The API builds this when loading a lesson.
- Fields on this document are **merged on top of** the matching row from `Labs.concepts`. The API does not copy `_id`, `lab`, or `slug` from the Concepts document into the response.
- **`codeFiles`**: Same file **names** as in the lab row; each object should include the file body as **`code`** (or **`content`** — the API maps that to **`code`** for the SPA) and optional **`lang`** (inferred from the filename, e.g. `.go` → `go`, when omitted). Optional **`role`**: `present` | `bad` | `exercise`. If the Concepts doc has no `codeFiles`, the API still returns tabs but with **empty** `code` strings shaped from the lab row’s names.

**Practice download** — on the same Concepts document, optional **`practice`**:

```json
{
  "zipName": "my-lab.zip",
  "folder": "my-lab",
  "files": [
    { "name": "go.mod", "content": "..." },
    { "name": "LAB.md", "content": "..." },
    { "name": "main.go", "content": "..." },
    { "name": "main_test.go", "content": "..." },
    { "name": "solution.go", "content": "..." }
  ]
}
```

Use normal subpaths in `name` (no `.` or `..` segments). The **Caching** template in-repo is **`sandbox/system-design/caching-practice/`** (`go.mod`, `LAB.md`, `main.go`, `main_test.go`, `solution.go` with `//go:build ignore`). To push that tree into Mongo, run **`make sync-caching-mongo`** (wrapper around **`go run ./cmd/sync-sandbox-practice`** with caching flags). For other topics, run **`sync-sandbox-practice`** with the right flags (from repo root with **`.env`** loaded, same pattern as the Makefile target); add a temporary **`Makefile`** target only while iterating, then remove it once **`Concepts.practice`** is set. Client ZIP: `apps/web/src/lib/practiceZip.ts`.

The **Load Balancer** practice bundle is **`sandbox/system-design/load-balancer/`** (concept **`system-design/load-balancing`**, ZIP name **`tracelab-load-balancer-practice.zip`**, folder **`load-balancer`**, files include **`present.go`** / **`bad.go`**). Sync with the same tool, e.g. **`cd services/api && go run ./cmd/sync-sandbox-practice -repo ../.. -sandbox system-design/load-balancer -concept system-design/load-balancing -zip tracelab-load-balancer-practice.zip -folder load-balancer -files go.mod,LAB.md,main.go,main_test.go,solution.go,present.go,bad.go`**. The **Implementation** panel shows only merged **`codeFiles`** from **`Labs`** / **`Concepts`** (e.g. **`present.go`** and **`bad.go`** for read-only comparison — keep **`main.go`** in the downloadable **`practice`** ZIP only). If **`practice.folder`** is **`load-balancer`**, the **round-robin** simulation is used even when **`vizType`** is **`lesson`** (see **`resolveVizComponent`** in **`ConceptDetailPage.tsx`**).

### 3. Frontend — routing and UI

Rendering is driven by **`apps/web/src/features/concepts/pages/ConceptDetailPage.tsx`**. After **`GET /api/catalog/lesson`** returns a merged lesson, the page picks **one** of:

| Kind | When | Where you register |
|------|------|---------------------|
| **Interactive simulation** | `vizType` is a key in **`VIZ_REGISTRY`** (e.g. `caching`, `singleton`, **`load-balancer`**) — or **`practice.folder`** is **`load-balancer`** for the bundled lab | **`apps/web/src/features/concepts/vizRegistry.tsx`** — add an adapter + entry. |
| **Text lesson** | `vizType` is `"lesson"`, **or** missing/empty, **or** not a simulation key — and the **`slug`** has a panel in **`LESSON_REGISTRY`** | **`apps/web/src/features/lessons/lessonRegistry.ts`** — **required** for every new text lesson. |

If nothing matches, the user sees **“This concept is not wired to a lesson UI yet”** with the **`vizType`** and **`slug`** from the API — use that to fix Mongo vs registry mismatch.

#### Frontend: text lesson (`vizType: "lesson"`)

Do this for “read the lesson on the left, optional code tabs on the right” (most catalog concepts).

1. **Create a lesson component** under **`apps/web/src/components/lessons/<lab>/YourLessonName.tsx`**.  
   - Props must match **`LessonPanelProps`** in **`lessonRegistry.ts`** (today: **`{ summary: string }`** — the catalog **`summary`** is passed through).  
   - Reuse **`LessonRoot`**, **`LessonProblem`**, **`LessonDiagram`**, etc. from **`apps/web/src/components/lesson-panels/LessonPanel.tsx`** like **`LoadBalancerL4L7Lesson.tsx`**.

2. **Register it by slug** in **`apps/web/src/features/lessons/lessonRegistry.ts`**:  
   - Import your component.  
   - Add a line: **`'your-concept-slug': YourLessonComponent`**  
   - The **object key must match exactly** the **`slug`** in **`Labs.concepts[]`** and in the URL **`/concept/<slug>`** (kebab-case). One slug ⇒ one registry entry. If Mongo uses a different slug (e.g. `load-balancing` vs `load-balancer`), add **another line** or change the catalog slug.

3. **Set `vizType` in Mongo** (recommended): on the **`Labs`** concept row, set **`"vizType": "lesson"`**.  
   You can also set **`vizType`** on the **`Concepts`** document; it merges over the lab row.  
   If **`vizType`** is omitted, the app still resolves a **`LESSON_REGISTRY`** panel when the **`slug`** is registered (see **`resolveLessonPanelComponent`** in **`ConceptDetailPage.tsx`**). Simulation types (`caching`, …) must still set **`vizType`** correctly so the sim branch wins.

4. **Code tabs (optional)** — put **`codeFiles`** on **`Labs`** and/or **`Concepts`** with **`name`**, **`lang`**, and **`code`** strings. The lesson page **Implementation** editor uses **only** this merged **`codeFiles`** list (not the **`practice`** ZIP file list).

#### Frontend: interactive simulation (not a text lesson)

Add **`vizType`** in Mongo to match a key in **`VIZ_REGISTRY`**, and implement the adapter in **`vizRegistry.tsx`** (parameters + metrics wiring).

#### Optional: per-concept completion (sidebar / progress)

If this lab should track **completed concepts**, ensure the lab id is listed in **`apps/web/src/features/concepts/conceptSectionExpectations.ts`** (`LABS_WITH_CONCEPT_COMPLETION`).

### 4. Quick verification

1. Open the app, select the lab, confirm the concept appears in the **library**.  
2. Open the **sidebar** link (item must have **`slug`** set).  
3. Confirm **`/api/catalog/lesson?lab=…&slug=…`** returns JSON with the fields you expect (`codeFiles`, `practice`, etc.).  
4. Confirm the **detail page** shows the correct lesson layout (not the “not wired” error) and code/practice behavior.  
5. If you added a **text lesson**, confirm **`lessonRegistry.ts`** contains an entry whose key equals the concept **`slug`**.

---

## API routes (reference)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/api/catalog/labs` | All lab catalog documents (drives library + sidebar cache) |
| GET | `/api/catalog/lesson?lab=&slug=` | Merged lesson for one concept |
| GET/POST | `/api/auth/*` | GitHub OAuth + session (when auth env is complete) |
