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

1. Ideate 
1a. Sitting down to review the requirements and writing out interpretations and features. 
1b. Narrow features to MVP
2. Design 
2a. Front-end UI design considerations
2b. workflow reviews
2c. wireframe mockups
3. Plan Create a plan for AI agents to run that incorporates all necessary requirements. 
3a. Work with Claude to review the plan against the test requirements to align plan intentions and confirm steps.
4. Execute Run the AI agent PROMPT.md with Claude CLI
5. Test Use for day planning 
5a. Get it to run
6. Get it right (MVP)

## Technical Reasonings

SQLite with EFCore - Serverless relational database in a cross-platform file EF Core adds ORM C# classes to database
tables and properties to columns 

React - Familiarity, flow of components

## Implementation

See PROMPT.md, DESIGN.md and CLAUDE.md

## Assumptions
- The requested stack requires database entry - Data needs to persist
- The utility is for individual day-to-day operations on a local instance.
  - No authentication was requested
  - User language is assumed to be English

## Scalability / future
Future iterations could provide:
- import/export capabilities to share tasks between individuals and teams
- sorting by labels

## Trade-offs
Identifiers used integer values instead of uniqueidentifiers to keep a low data size.
Claude CLI did not provide a UI method of adding sorting to the tasks
