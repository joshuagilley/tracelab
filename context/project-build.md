Project summary for Cursor

Build a monorepo called TraceLab. It is a lightweight learning tool for system design concepts.

Tech choices:

Frontend: React + TypeScript + Vite

Backend: Go

Database: MongoDB optional, not required for MVP

The first goal is not a production-grade platform. The first goal is to create a clean scaffold for a web app where the user can browse system design concepts and open a concept page for an interactive lesson.

The first implemented concept will be Caching.

The product should have:

A concept library page

A concept detail page

Reusable UI layout for future concepts

A small Go backend that serves concept metadata and later can serve simulation events

For now, keep the backend simple. We do not need authentication, advanced persistence, or real-time infrastructure yet. We only need a foundation that can grow into interactive simulations later.

Architecture goals

Keep the codebase modular and easy to extend

Treat each system design concept as a reusable scenario/module

Frontend should not hardcode everything into one page

Backend should expose a small set of routes for concept data

Keep MongoDB integration optional and behind a clean interface so it can be added later without reworking the core app

Suggested folder structure

tracelab/
  README.md
  docs/
    product-vision.md
    roadmap.md
    scenarios.md
    design-system.md
  apps/
    web/
      src/
        app/
        components/
        features/
        pages/
        routes/
        styles/
        types/
        data/
      public/
      package.json
      tsconfig.json
      vite.config.ts
  services/
    api/
      cmd/server/
      internal/
        concepts/
        scenarios/
        transport/http/
        config/
        storage/
      go.mod
  tooling/
    scripts/
  .gitignore
  Makefile

Backend scaffold request for Cursor

Create a simple Go backend with:

a clean entry point in cmd/server

internal package structure for concepts, scenarios, and HTTP transport

a health endpoint

a concepts endpoint that returns static concept metadata as JSON for now

Example routes:

GET /health

GET /api/concepts

GET /api/concepts/:id

Use plain net/http or a lightweight router. Keep it simple and readable.

Define a Concept model with fields like:

id

title

slug

summary

difficulty

tags

status

Seed the API with a handful of concepts as static in-memory data:

caching

rate-limiting

load-balancing

retries

circuit-breaker

pub-sub

sharding

queues

MongoDB should not be wired in yet unless needed for a storage interface placeholder. If added, keep it abstracted under a storage package.

Frontend scaffold request for Cursor

Create a React + TypeScript + Vite frontend with:

React Router

a simple app shell

a dark theme

reusable layout and card components

a concept library page

a concept detail page

Pages:

/ concept library page

/concept/:slug concept detail page

Frontend behavior:

Fetch concept list from the Go backend

Render concept cards in a grid

Clicking a card opens the concept detail page

For now the detail page can display static sections:

title

summary

placeholder code panel

placeholder simulation panel

takeaways

tradeoffs

Use a lightweight state approach. Avoid overengineering.

Frontend implementation guidance

Use a simple component hierarchy such as:

AppShell

Sidebar

Topbar

ConceptCard

SectionCard

CodePanel

SimulationPanel

InfoPanel

Feature organization can look like:

features/concepts/api.ts

features/concepts/components/ConceptCard.tsx

features/concepts/pages/ConceptLibraryPage.tsx

features/concepts/pages/ConceptDetailPage.tsx

Styling guidance for Cursor

Use a simple design system with:

dark background

one accent color

soft borders

rounded cards

readable typography

generous spacing

consistent panel styling

You can use plain CSS modules, Tailwind, or a lightweight UI library. Prefer simple and consistent over fancy.

MVP deliverable

By the end of the first scaffold, the repo should run locally and provide:

a Go API returning concept data

a React frontend displaying concept cards

a concept detail page for Caching

placeholder code and visualization panels ready for future interactive behavior
