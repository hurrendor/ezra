# Background / Context
Task management utility for an individual SWE's day-to-day, built as a take-home assessment. Priorities: clean architecture, production-minded MVP, clear tradeoffs — not over-engineering.

# Task Management Prompt

Please use README.md, DESIGN.md and existing folder/code infrastructure to update the code to match requirements for this task management utility using .NET Core, SQLite with EF Core, and React.

## Core Workflow
1. Review the docs.
2. Review the code already present.
3. Make alterations to the code to correct any data that doesn't match the requirements and docs.
   a. Run and verify frontend/ builds and starts; report actual command output.
   b. Run and verify backend/ builds and starts; report actual command output.

## API Design
- Use resource-based REST conventions, not RPC-style routes:
   - `POST /tasks`, `GET /tasks`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}`
   - `POST /labels`, `PATCH /labels/{id}`, `DELETE /labels/{id}`
- Task reordering: implement sparse integer ordering (gap of 1000 between tasks). On move, set order to the midpoint of the new neighbors; if no gap remains, renumber the affected column. Expose via `PATCH /tasks/{id}` with a target position (e.g. previous/next task id), computing the new order server-side.
- Include input validation and consistent error response shape (e.g. `{ "error": "message" }` with appropriate HTTP status codes) for all endpoints.
- Add basic request logging (method, path, status, duration).

## Frontend
Use React and MUI to create a bare-bones 3-column board with flexbox list items in App.tsx.

Each list item contains:
- a header tag (data: `title`)
- an optional description (data: `description`)
- a small red icon if the task is flagged (data: `isFlagged`)
- a 'close/delete' icon to delete the task
- label(s), shown as inline chips; clicking a chip opens a small dropdown to add/remove labels for that task
- a status control (dropdown) to move the task between To-do / In Progress / Done
- on click action:
   - clicking the header or description turns it into an active/editable field
   - on click-off, if there are changes, send an update API call

Drag-and-drop reordering within/between columns is out of scope for this pass — status changes go through the dropdown control only. Note this explicitly as a documented deferral, not an omission.

Provide unit tests for the production MVP.

## Backend
- Provide build options to:
   - Seed the database with a few sample tasks for generic tech company onboarding.
   - Ship an empty database schema for the UI to fill.
- Provide unit tests for the production MVP.

## Docker
Set up a Docker config to ship this as two services (frontend, backend) via docker-compose, each with its own Dockerfile. Backend Dockerfile should apply EF Core migrations on container start.

## Documentation
Add brief code comments or a short decisions log noting key tradeoffs (ordering strategy, REST vs RPC, deferred drag-and-drop, etc.) so they can be explained and defended in a follow-up discussion.