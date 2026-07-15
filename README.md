# Task management API and front-end.
## Prompt
Build a small to-do task management API and frontend.

## Interpretation
A task management tool for an individual SWE day-to-day that can grow with demand and minimal maintenance.

## Approach

1. Ideate
   Sitting down to review the requirements and writing out interpretations and features. Narrowing features to MVP
2. Design
   Front-end UI design considerations, workflow reviews, wireframe mockups
3. Plan
   Create a plan for AI agents to run that incorporates all necessary requirements. Work with Claude to review the plan against the test requirements to align plan intentions and confirm steps.
4. Execute
    Run the AI agent PROMPT.md with Claude CLI
5. Test
    Use for day planning

## Tech list
.NET Core -
SQLite with EFCore - Serverless relational database in a cross-platform file  EF Core adds mapping C# classes to database tables and properties to columns
React - Familiarity, flow of components


## Implementation
### Basic API
/tasks - returns all tasks
#### Task management
/tasks/addTask, /tasks/updateTask/{taskGuid}, /tasks/removeTask
#### Label management
/tasks/addLabel, /tasks/updateLabel/{labelGuid}, /tasks/removeLabel
