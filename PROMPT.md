# Background / Context
Task management utility

# Task Management Prompt

Please use README.md, DESIGN.md existing folder and code infrastructure to update the code to match requirements for this simple task management utility using .NET Core, SQLLite with EFCore, and React.

## Core Workflow
1. Review the docs.
2. Review the code already present.
3. Make alterations to the code to correct any data that doesn't match with the requirements and docs.
   a. Test that frontend/ runs and builds
  b. Test that backend/ runs and builds.
## Frontend
Use React and MUI to create a bare-bones 3-columns with flexbox list items in App.tsx

The list items elements will contain:
- a header tag (data:`title`)
- an optional description (data:`description`)
- a small red icon if the task is marked flagged (data:`isFlagged`)
- a 'close/delete' icon to delete the task
- on click action
  - on click of the header tag or the optional description, the header tag will become an active type field
  - on click off, if there are changes, the task will send an update API call
- label(s) 



Provide unit tests for the production MVP

## Set up a Docker config and container to ship this
## Backend

- Provide build options to:
    - Seed the database with a few sample tasks for generic tech company onboarding.
    - Ship an empty database schema for the UI to fill

- Provide unit tests for the production MVP