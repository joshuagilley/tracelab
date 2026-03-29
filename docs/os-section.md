# TraceLab — Operating Systems section

**Product spec + architecture guide** for this library. TraceLab ships this as **React + TypeScript** (Vite); simulation logic can live in the client first, or move to Go later if you want server-side stepping.

---

## Purpose

The Operating Systems section teaches engineers how systems actually work underneath their applications. This is not a reference or documentation section. It is a set of **interactive simulations** that build intuition around processes, memory, concurrency, and system orchestration.

The goal is for users to understand **why real-world systems fail, slow down, or behave unpredictably under load**.

---

## Core philosophy

- Visual over theoretical  
- Simulation over explanation  
- Systems thinking over syntax  
- Tie every concept to real-world engineering problems  

Each module should answer: **“Where does this show up in real systems I build?”**

---

## Section structure

Operating Systems is broken into **five domains**:

1. **Processes & threads**  
2. **Memory**  
3. **Scheduling & concurrency**  
4. **File systems**  
5. **Shell & process orchestration**  

Each domain contains interactive modules (see catalog in `apps/web/src/features/operating-systems/operating-systems.json` and nav in `operatingSystemsNav.ts`).

---

## 1. Processes & threads

**Goal:** Understand how programs execute and how concurrency is modeled at the OS level.

**Concepts:** process lifecycle, threads vs processes, context switching, isolation vs shared memory.

**Modules**

- **Process vs thread simulation** — multiple processes (isolated memory) vs threads (shared heap). Visual: memory space per process, shared region for threads.  
- **Context switching cost** — CPU switching between tasks; timeline of execution; tie to API latency under load and “too many threads.”

---

## 2. Memory

**Goal:** Build intuition for how memory works and why systems crash or slow down.

**Concepts:** stack vs heap, allocation, leaks, virtual memory, paging.

**Modules**

- **Stack vs heap** — allocate variables; show stack growth vs heap.  
- **Memory leak simulator** — objects not freed → gradual exhaustion; tie to long-running services, Python/Node heaps.  
- **Virtual memory & paging** — RAM vs disk, page swaps; tie to slow systems under pressure and large working sets.

---

## 3. Scheduling & concurrency

**Goal:** Understand how tasks are managed and why concurrency models break.

**Concepts:** CPU scheduling, queues, fairness, starvation, deadlocks.

**Modules**

- **Scheduling algorithms** — FIFO, round robin, weighted; task timelines.  
- **Queue system simulation** — incoming requests, worker pool, backpressure; tie to SQS-style design and API rate limiting.  
- **Deadlock simulator** — resource locking, circular wait.

---

## 4. File systems

**Goal:** Understand how data is stored and accessed at a low level.

**Concepts:** files and directories, inodes, file descriptors, disk I/O.

**Modules**

- **File tree explorer** — directory structure and relationships.  
- **Read/write simulation** — disk access and latency differences; tie to logging and data pipelines.

---

## 5. Shell & process orchestration

**Goal:** Teach composition with shell primitives.

**Concepts:** stdin/stdout/stderr, pipes, process spawning, background jobs, scripting as orchestration.

**Modules**

- **Pipe system** — command chaining, data flow (e.g. `cat → grep → sort`); tie to ETL and streaming.  
- **Process tree** — parent/child, background jobs.  
- **File descriptor visualization** — stdout, stderr, redirection.  
- **Shell pipeline builder** — user-built multi-step flows; tie to CI/CD and automation.

---

## Architecture (TraceLab-aligned)

### Frontend (React + TypeScript)

- **Role:** visualize state transitions; controls for “step,” “reset,” presets.  
- **Reusable views:** timeline (scheduling), memory diagram (stack/heap/paging), graph (processes), pipeline (shell).  
- **Detail page:** extend `ConceptDetailPage` with an `operating-systems` branch (same pattern as other labs) or a dedicated `OperatingSystemsLessonPanel` that switches on `slug`.

### Simulation core (TypeScript first, Go optional)

- **Role:** deterministic state machine per module — no long-running arbitrary compute.  
- **Shape (conceptual):**

```go
// Go sketch; TypeScript equivalent is a plain object + pure step function.
type Simulation interface {
    Step(input Action) State
    Reset() State
}
```

- **Principles:** precomputed scenarios where helpful; deterministic steps; cheap in the browser.

### Data / cost

- No long-running compute on shared infra for v1.  
- Prefer bundled scenarios + client-side stepping.  
- If you add a Go API later, keep payloads small (state snapshots, not full traces).

---

## Design principles

1. Every module must be **interactive**.  
2. Every module must **visualize state**.  
3. No passive reading as the primary experience.  
4. Tie every concept to **real-world systems**.  
5. Keep modules **small and composable**.

---

## Example flagship module

**“Why your API breaks under load”**

- Simulate ~50 incoming requests.  
- Compare thread-per-request vs queue + worker pool.  
- Show latency, failures, resource exhaustion.

---

## Future extensions

- Containers (namespaces, cgroups)  
- Networking (sockets, TCP lifecycle)  
- Bridge to distributed systems (queues, workers) — cross-link System Design / Cloud Architecture  

---

## Summary

This section turns operating systems from a theoretical subject into a **practical intuition layer**: engineers understand not only how to build systems, but **how they behave under real-world conditions**.

---

## Using this doc with Cursor

1. Keep this file as the source of truth for scope and module list.  
2. Implement one module end-to-end first (recommended: **queue system simulation** or **process vs thread**): data structures → `Step`/`Reset` → minimal UI → wire `slug` in catalog + `ConceptDetailPage` / panel.  
3. Follow the general checklist in the repo **README** (“Developer guide: adding or extending a concept”).

---

## Repo locations

| What | Where |
|------|--------|
| Catalog (titles, slugs, status) | `apps/web/src/features/operating-systems/operating-systems.json` |
| Sidebar curriculum | `apps/web/src/features/operating-systems/operatingSystemsNav.ts` |
| Lab id | `operating-systems` in `apps/web/src/contexts/lab.tsx` |
| Lesson UI routing | `apps/web/src/features/concepts/pages/ConceptDetailPage.tsx` (add when first module ships) |
