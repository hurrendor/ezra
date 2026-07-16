# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**`README.md` is the source of truth** for requirements and direction. Where `DESIGN.md` or `PROMPT.md` conflict with it, README wins (DESIGN self-contradicts on labels/drag-drop and uses SQL-Server types on a SQLite app; PROMPT is the oldest draft). Use DESIGN only for schema detail README omits.

## Overview

Ezra is a task-management app (single-user, local) split into two independently-run projects:

- `backend/` — ASP.NET Core Minimal API (`Ezra.Api`, .NET 10) over SQLite via **EF Core** (`Microsoft.EntityFrameworkCore.Sqlite`).
- `frontend/` — React 19 SPA, **TypeScript + MUI**, built with Vite 8, linted with oxlint.

The two are not wired together yet (no dev proxy, no fetch calls in the UI). Connecting them is expected work.

## Commands

Backend (run from `backend/`):
- `dotnet run` — start the API. Default HTTP URL `http://localhost:5195` (see `Properties/launchSettings.json`); `--launch-profile https` also serves `https://localhost:7191`.
- `dotnet build` — build.
- `dotnet ef migrations add <Name>` / `dotnet ef database update` — manage schema (migrations, not `EnsureCreated`).
- `dotnet test` — run xUnit tests.

Frontend (run from `frontend/`):
- `npm run dev` — Vite dev server.
- `npm run build` — production build.
- `npm run lint` — oxlint.
- `npm run preview` — serve the production build.
- `npm run test` — Vitest + React Testing Library.

## Decided architecture

Settled decisions (see README for full requirements):

- **Data access: EF Core with migrations.** No raw SQL, no repository layer. Schema evolves via `dotnet ef migrations`; startup applies `db.Database.Migrate()` (not `EnsureCreated`). Docker backend applies migrations on container start.
- **Primary keys are `int`** (SQLite rowid-backed), not GUIDs. DESIGN's GUID/`UNIQUEIDENTIFIER`/`NVARCHAR` types are SQL-Server sketch — ignore the dialect, keep the shape.
- **Entities:** `Task` (title, description, status, order, isFlagged, created/modified dates), `Label`, and a `TaskLabel` join (many-to-many). `SessionRecords` from DESIGN is **dropped** — README never uses it; persistence is covered by tasks living in SQLite.
- **Status** is a C# enum `{ Todo, InProgress, Done }` stored as string. UI columns: "To-do / In Progress / Done".
- **Ordering: sparse integer, gap of 1000.** On move, set order to midpoint of new neighbors; renumber the column when a gap is exhausted. Driven via `PATCH /tasks/{id}` with a target neighbor; new order computed server-side.
- **REST routes (resource-based, no RPC, no `/api` prefix, no PUT):**
  - `GET /tasks`, `GET /tasks/{id}`, `POST /tasks`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}`
  - `GET /labels`, `POST /labels`, `PATCH /labels/{id}`, `DELETE /labels/{id}`
- **Validation + consistent error shape** `{ "error": "message" }` with appropriate HTTP status codes on every endpoint.
- **Request logging:** method, path, status, duration.
- **Build options:** seed DB with sample onboarding tasks, or ship an empty schema for the UI to fill.

## Frontend notes

- MUI 3-column flexbox board in `App.tsx`. Each task card: title header, optional description, red flag icon when `isFlagged`, delete icon, label chips (chip click opens add/remove dropdown), status dropdown to move between columns.
- Inline edit: clicking title/description turns it editable; on click-off, if changed, send an update API call.
- **Drag-and-drop reordering is a documented deferral** — status changes go through the dropdown only.

## Testing

- Backend: **xUnit** (SQLite in-memory or EF InMemory provider).
- Frontend: **Vitest + React Testing Library**.
- Scope tests to the production MVP.

## Docker

- `docker-compose` with two services (frontend, backend), each with its own Dockerfile. Backend Dockerfile applies EF Core migrations on container start.

## Documentation

- Keep a short decisions log (this file + code comments) noting key tradeoffs — ordering strategy, REST vs RPC, deferred drag-and-drop, int vs GUID — so they can be defended in follow-up discussion.

## Implementation status (as of migration start)

Not yet built — the repo is mid-migration from boilerplate:

- Backend `Program.cs` currently has only `GET /api/todos`, a `TodoItem` record, table `todos`, and `EnsureCreated` + a seed row. This is the **starting point**, not the target above.
- Frontend is plain `.jsx` boilerplate — no MUI, no TypeScript, no tests, no API calls.
- No migrations, no Docker, no tests exist yet.

When implementing, replace the boilerplate to match the decided architecture; do not preserve the `TodoItem`/`todos`/`/api/todos` shape.
