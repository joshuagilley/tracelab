<p align="center">
  <img src="apps/web/public/general/logo-v2.png" alt="TraceLab" width="340" />
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

| Variable                                   | Required for   | Purpose                                                                                                                        |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `MONGO_DB_URI`                             | Catalog + auth | Mongo connection string. Without it the API starts but **does not** register `/api/catalog/*` (the app will not load lessons). |
| `MONGO_DB_NAME`                            | Mongo          | Database name (default `tracelab`).                                                                                            |
| `LABS_COLLECTION`                          | Catalog        | Lab catalog documents (default `Labs`).                                                                                        |
| `CONCEPTS_COLLECTION`                      | Lesson merge   | Per-concept detail documents (default `Concepts`).                                                                             |
| `USERS_COLLECTION`                         | Auth           | Users (default `Users`).                                                                                                       |
| `COMPLETED_COLLECTION`                     | Progress       | Completed concepts (default `Completed`).                                                                                      |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Auth           | GitHub OAuth.                                                                                                                  |
| `OAUTH_CALLBACK_URL`                       | Auth           | Registered callback URL (e.g. `http://localhost:5173/api/auth/github/callback` when using the Vite proxy).                     |
| `AUTH_JWT_SECRET`                          | Auth           | Secret for session JWT.                                                                                                        |
| `FRONTEND_ORIGIN`                          | CORS           | SPA origin (default `http://localhost:5173`).                                                                                  |
| `AUTH_COOKIE_CROSS_SITE`                   | Auth           | Set to `true` if API and SPA are on different sites (cookies `SameSite=None; Secure`).                                         |

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

| Path            | Role                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| `apps/web/`     | React + Vite SPA                                                                      |
| `services/api/` | Go HTTP API (`cmd/server`)                                                            |
| `sandbox/`      | **Dev-only** practice code (see `sandbox/README.md`). Not imported by the app or API. |

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

### 1. MongoDB — `Labs` (structure) and `Concepts` (content)

**Model:** **`Labs`** describes the library shell (title, panel chrome, topic groupings). **`Concepts`** holds every concept’s metadata and full payload (list fields, **`codeFiles`**, **`practice`**, **`parameters`**, etc.). The API still responds with **`concepts`** and **`navSections`** for the SPA: it **assembles** those from **`Concepts`** plus the lab’s **`topics`** (see below).

#### `Labs` — one document per lab (`_id` = frontend lab id, same as in `apps/web/src/contexts/lab.tsx`)

- **`title`**, **`panelPrefix`**, optional **`languages`**, **`defaultOpenSectionIds`**
- **`topics`** — array of `{ "id", "title", "blurb", "conceptSlugs": ["slug1", …] }`. Sidebar order follows **`conceptSlugs`** within each topic.
- **Do not** embed a **`concepts`** array or **`navSections`** in Mongo for new work (legacy deployments may still have them until migrated).

#### `Concepts` — one document per concept

- **`_id`**: **`"<labId>/<slug>"`**
- **`labId`**, **`topicId`** (matches the **`topics[].id`** that lists this slug), **`slug`**
- List + lesson fields (see `apps/web/src/features/curriculum/lab-catalog-types.ts` and `apps/web/src/types/concept.ts`):

| Field                                              | Notes                                                                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                               | Stable string (often the same as `slug`).                                                                                                                                                             |
| `slug`                                             | URL segment; **unique within the lab**; must appear under **`topics[].conceptSlugs`** for a sidebar link.                                                                                              |
| `title`, `summary`, `difficulty`, `tags`, `status` | `status`: `available` or `coming-soon`.                                                                                                                                                               |
| `labKind`                                          | Usually the lab id string (e.g. `system-design`).                                                                                                                                                     |
| `vizType`                                          | `"lesson"` or a simulation key registered in `lib/simulation-registry/` (see §3).                                                                                                                    |
| `codeFiles`                                        | Tab list + bodies: **`code`** (or **`content`**) per file; optional **`role`**: `present` \| `bad` \| `exercise`.                                                                                      |

After changing catalog data, reload the app so **`fetchLabsCatalogIntoCache`** runs again.

#### Legacy API behavior (pre-migration)

If a **`Labs`** document still has embedded **`concepts[]`**, the API continues to merge lessons the old way until you migrate.

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

Use normal subpaths in `name` (no `.` or `..` segments). **One command** syncs any sandbox folder into **`Concepts.practice`**: **`services/api/cmd/sync-sandbox-practice`**. From the **repo root** (with **`.env`** if you use Atlas/local Mongo), run **`make sync-sandbox-mongo`** and pass **`SANDBOX`** (path under **`sandbox/`**), **`CONCEPT`** (**`Concepts._id`**), **`ZIP`** (download basename), **`FOLDER`** (directory inside the ZIP), and **`FILES`** (comma-separated names, ZIP order). The **`Makefile`** prints usage if any variable is missing.

**Caching** example:

`make sync-sandbox-mongo SANDBOX=system-design/caching-practice CONCEPT=system-design/caching ZIP=tracelab-caching-practice.zip FOLDER=caching-practice FILES=go.mod,LAB.md,main.go,main_test.go,solution.go`

**Load balancer** example (adds **`present.go`** / **`bad.go`**):

`make sync-sandbox-mongo SANDBOX=system-design/load-balancer CONCEPT=system-design/load-balancing ZIP=tracelab-load-balancer-practice.zip FOLDER=load-balancer FILES=go.mod,LAB.md,main.go,main_test.go,solution.go,present.go,bad.go`

Equivalent: **`cd services/api && go run ./cmd/sync-sandbox-practice -repo ../..`** plus **`-sandbox`**, **`-concept`**, **`-zip`**, **`-folder`**, **`-files`**. Client ZIP build in the browser: `apps/web/src/lib/practice-zip.ts`.

The **Implementation** panel shows **`codeFiles`** from the **`Concepts`** document (e.g. **`present.go`** and **`bad.go`** for read-only comparison — keep **`main.go`** in the downloadable **`practice`** ZIP only). If **`practice.folder`** is **`load-balancer`**, the **round-robin** simulation is used even when **`vizType`** is **`lesson`** (see **`resolveVizComponent`** in **`lesson-page.tsx`**).

### 3. Frontend — routing and UI

Rendering is driven by **`apps/web/src/features/learning/pages/lesson-page.tsx`**. After **`GET /api/catalog/lesson`** returns a merged lesson, the page picks **one** of:

| Kind                       | When                                                                                                                                                              | Where you register                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Interactive simulation** | `vizType` is a key in **`VIZ_REGISTRY`** (e.g. `caching`, `singleton`, **`load-balancer`**) — or **`practice.folder`** is **`load-balancer`** for the bundled lab | **`apps/web/src/lib/simulation-registry/`** — add an adapter + **`index.ts`** entry.                  |
| **Text lesson**            | `vizType` is `"lesson"`, **or** missing/empty, **or** not a simulation key — and the **`slug`** has a panel in **`LESSON_REGISTRY`**                              | **`apps/web/src/features/curriculum/lesson-registry.ts`** — **required** for every new text lesson. |

If nothing matches, the user sees **“This concept is not wired to a lesson UI yet”** with the **`vizType`** and **`slug`** from the API — use that to fix Mongo vs registry mismatch.

#### Frontend: text lesson (`vizType: "lesson"`)

Do this for “read the lesson on the left, optional code tabs on the right” (most catalog concepts).

1. **Create a lesson component** under **`apps/web/src/components/lessons/<lab>/YourLessonName.tsx`**.
   - Props must match **`LessonPanelProps`** in **`lesson-registry.ts`** (today: **`{ summary: string }`** — the catalog **`summary`** is passed through).
   - Reuse **`LessonRoot`**, **`LessonProblem`**, **`LessonDiagram`**, etc. from **`apps/web/src/components/lesson-panels/LessonPanel.tsx`** like **`LoadBalancerL4L7Lesson.tsx`**.

2. **Register it by slug** in **`apps/web/src/features/curriculum/lesson-registry.ts`**:
   - Import your component.
   - Add a line: **`'your-concept-slug': YourLessonComponent`**
   - The **object key must match exactly** the **`slug`** on the **`Concepts`** document and in the URL **`/concept/<slug>`** (kebab-case). One slug ⇒ one registry entry. If Mongo uses a different slug (e.g. `load-balancing` vs `load-balancer`), add **another line** or change the catalog slug.

3. **Set `vizType` in Mongo** (recommended): on the **`Concepts`** document, set **`"vizType": "lesson"`**.  
   (Legacy: **`vizType`** on an embedded **`Labs.concepts[]`** row still merges with **`Concepts`** until you migrate.)  
   If **`vizType`** is omitted, the app still resolves a **`LESSON_REGISTRY`** panel when the **`slug`** is registered (see **`resolveLessonPanelComponent`** in **`lesson-page.tsx`**). Simulation types (`caching`, …) must still set **`vizType`** correctly so the sim branch wins.

4. **Code tabs (optional)** — put **`codeFiles`** on the **`Concepts`** document with **`name`**, **`lang`**, and **`code`** strings. The lesson page **Implementation** editor uses **only** this **`codeFiles`** list (not the **`practice`** ZIP file list).

#### Frontend: interactive simulation (not a text lesson)

Add **`vizType`** in Mongo to match a key in **`VIZ_REGISTRY`**, and implement the adapter under **`lib/simulation-registry/adapters/`** (parameters + metrics wiring).

#### Optional: per-concept completion (sidebar / progress)

If this lab should track **completed concepts**, ensure the lab id is listed in **`apps/web/src/features/learning/progress/section-expectations.ts`** (`LABS_WITH_CONCEPT_COMPLETION`).

### 4. Quick verification

1. Open the app, select the lab, confirm the concept appears in the **library**.
2. Open the **sidebar** link (item must have **`slug`** set).
3. Confirm **`/api/catalog/lesson?lab=…&slug=…`** returns JSON with the fields you expect (`codeFiles`, `practice`, etc.).
4. Confirm the **detail page** shows the correct lesson layout (not the “not wired” error) and code/practice behavior.
5. If you added a **text lesson**, confirm **`lesson-registry.ts`** contains an entry whose key equals the concept **`slug`**.

---

## API routes (reference)

| Method   | Path                             | Purpose                                                    |
| -------- | -------------------------------- | ---------------------------------------------------------- |
| GET      | `/health`                        | Health check                                               |
| GET      | `/api/catalog/labs`              | All lab catalog documents (drives library + sidebar cache) |
| GET      | `/api/catalog/lesson?lab=&slug=` | Merged lesson for one concept                              |
| GET/POST | `/api/auth/*`                    | GitHub OAuth + session (when auth env is complete)         |
