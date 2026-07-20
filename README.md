# Background / Context

Task management utility for an individual SWE's day-to-day, built as a take-home assessment.

## Run

   /backend `dotnet run`
- builds on http://localhost:5195
  /frontend `npm install` `npm build`
- builds to http://localhost:5173/

## Prompt Given

Build a small to-do task management API and frontend.

## Interpretation

A task management tool for an individual SWE day-to-day that can grow with demand and minimal maintenance.

## Approach

1. Ideate Sitting down to review the requirements and writing out interpretations and features. Narrowing features to
   MVP
2. Design Front-end UI design considerations, workflow reviews, wireframe mockups
3. Plan Create a plan for AI agents to run that incorporates all necessary requirements. Work with Claude to review the
   plan against the test requirements to align plan intentions and confirm steps.
4. Execute Run the AI agent PROMPT.md with Claude CLI
5. Test Use for day planning Get it to run
6. Get it right (MVP)
7. Get it fast

## Technical Reasonings

SQLite with EFCore - Serverless relational database in a cross-platform file EF Core adds ORM C# classes to database
tables and properties to columns React - Familiarity, flow of components

## Implementation

See PROMPT.md, DESIGN.md

