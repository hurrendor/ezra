# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Ezra is a task-management app split into two independently-run projects:

- `backend/` — ASP.NET Core Minimal API (`Ezra.Api`, .NET 10), talking to SQLite via raw `Microsoft.Data.Sqlite` (no EF Core / ORM).
- `frontend/` — React 19 SPA built with Vite 8, linted with oxlint.

The two are not wired together yet (no dev proxy, no fetch calls in the UI) — the frontend is boilerplate and the backend exposes a `/api/todos` endpoint. Connecting them is expected work.

## Commands

Backend (run from `backend/`):
- `dotnet run` — start the API. Default HTTP URL is `http://localhost:5195` (see `Properties/launchSettings.json`); `--launch-profile https` also serves `https://localhost:7191`.
- `dotnet build` — build.

Frontend (run from `frontend/`):
- `npm run dev` — Vite dev server.
- `npm run build` — production build.
- `npm run lint` — oxlint.
- `npm run preview` — serve the production build.

## Architecture notes

- **Database access is hand-written SQL.** `backend/Program.cs` opens a `SqliteConnection` per request and issues raw `CommandText`. There is no repository layer, migrations tool, or model-mapping framework. `InitializeDatabase` runs `CREATE TABLE IF NOT EXISTS` (plus a seed row) at startup — schema changes go here, not in a migrations folder. The SQLite file (`tasks.db`) is created next to the running process.
- **Everything backend lives in `Program.cs`** for now: endpoint definitions, DB init, and the `TodoItem` record. Note the DB column names are snake_case (`is_done`) while the C# record is PascalCase — the mapping is manual in the reader loop.
- **Connection string** comes from configuration key `ConnectionStrings:DefaultConnection`, falling back to `Data Source=tasks.db`.
- **Frontend lint rules** (`frontend/.oxlintrc.json`) enforce React rules-of-hooks as an error; `only-export-components` is a warning with `allowConstantExport`.
