# Production MVP

## Core Workflow

1. Review the docs.
2. Review the code already present.
3. Make alterations to the code to correct any data that doesn't match the requirements and docs. a. Run and verify
   frontend/ builds and starts; report actual command output. b. Run and verify backend/ builds and starts; report
   actual command output.

## User workflows

As a user, I can

1. add a new task a. to "To-do"
   1b. to "In progress"
2. update a task b. change state from "todo" to "in progress"
   2a. change state from "in progress" to "done"
   2b. change order of the task 
   2c. change flag (isFlagged) to true or false
3. save tasks for persistent data on task updates
4. delete a task
5. come back to the session later and recover my previous sessions' data

## UI

### UI Description

- There are 3 columns - "To-Do", "In Progress", "Done"
- A task (title, description, and status) can be added, updated and deleted
- Tasks can be sorted by a user defined order (numerical)
- Urgent tasks can be 'flagged' and have a visual cue

### Features

- A task status can be updated by dragging the task to the updated header.

- On task or label change, the UI will send a new POST request to the server.

## Backend

New tasks are mapped and added to dbo.Tasks. Task order uses gap-based ordering (space new items by 1000) to allow for
short to medium term re-ordering. At some point, this may need to be updated.

### API

- Use resource-based REST conventions - for HTTP status codes
- Task reordering: implement sparse integer ordering (gap of 1000 between tasks). On move, set order to the midpoint of
  the new neighbors; if no gap remains, renumber the affected column. Expose via `PATCH /tasks/{id}` with a target
  position (e.g. previous/next task id), computing the new order server-side.
- Include input validation and consistent error response shape (e.g. `{ "error": "message" }` with appropriate HTTP
  status codes) for all endpoints.
- Add basic request logging (method, path, status, duration).

#### Task management

POST /tasks
PUT /tasks/{id}
PATCH /tasks/{id}
DELETE /tasks/{id}

#### Label management
POST /labels
PUT /labels/{id}
PATCH /labels/{id}
DELETE /labels/{id}

### Data table structures

-- org.SessionRecords
--- GUID          UNIQUEIDENTIFIER
--- createdDate   DATETIME
--- userSortOrder NVARCHAR(50)

-- dbo.Tasks
--- GUID          UNIQUEIDENTIFIER
--- createdDate   DATETIME
--- modifiedDate  DATETIME
--- status        TEXT
--- title         NVARCHAR()
--- description   TEXT
--- order         INT
--- isFlagged     BOOLEAN

-- dbo.Labels
--- GUID          UNIQUEIDENTIFIER
--- description   NVARCHAR()
--- order         INT

-- dbo.Labels2Tasks
--- GUID          UNIQUEIDENTIFIER
--- TaskGUID      UNIQUEIDENTIFIER
--- LabelGUID     UNIQUEIDENTIFIER


# Out of Scope

## Future feature considerations

- Headers can collapse / be hidden
- Header columns provide the ability to change the layout of the tasks
- A task label can be added, updated and deleted
- Closing a task triggers an undo prompt
- Tasks can be sorted by label, "most recent", and numerical sorting
- Clicking a task opens up a more detailed view
    - A task status can be updated by dragging the task to the updated header.
- Tasks can be moved by clicking the task and updating a drop-down option
- The "done" section can be cleared out
- Time blocking can be added as a detail
- User can import tasks in a CSV or JSON format

- Docker setup