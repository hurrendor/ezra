## User workflows

As a user, I can

1. add a new task
   a. to "To-do"
   b. to "In progress"
2. update a task
   b. change state from "todo" to "in progress"
   a. change state from "in progress" to "done"
   c. change order of the task
3. save tasks for persistent data on task updates
4. delete a task
5. come back to the session later and recover my previous sessions' data

## Production MVP

### UI

- There are 3 columns - "To-do", "In progress", "Done"
- A task can be added, updated and deleted
- Task (title, description, and status) can be updated
- Tasks can be sorted by a user defined order (numerical)
- Urgent tasks can be 'flagged' and have a visual cue

### Backend

### Data table structure

-- Task
--- GUID
--- createdDate
--- modifiedDate
--- status
--- title
--- description
--- order

-- Label
--- GUID
--- description
--- order

-- Labels2Task
--- GUID
--- TaskGUID
--- LabelGUID


## Out of Scope
### Other Nice to Have Features
- Headers can collapse / be hidden
- Header columns provide the ability to change the layout of the tasks
- A task label can be added, updated and deleted
- Closing a task triggers an undo prompt
- Tasks can be sorted by label, "most recent", and numerical sorting
- Tasks can be dragged to the next progress section
- Clicking a task opens up a more detailed view
- Tasks can be moved by clicking the task and updating a drop-down option
- The "done" section can be cleared out
- Time blocking can be added as a detail