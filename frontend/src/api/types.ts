// Mirrors the backend DTOs (see backend/Dtos). Status is serialized as its
// enum name ("Todo" | "InProgress" | "Done"), not a number.

export type TaskStatus = 'Todo' | 'InProgress' | 'Done'

export const STATUSES: TaskStatus[] = ['Todo', 'InProgress', 'Done']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Todo: 'To-do',
  InProgress: 'In Progress',
  Done: 'Done',
}

export interface Label {
  id: number
  name: string
  order: number
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  order: number
  isFlagged: boolean
  createdDate: string
  modifiedDate: string
  labels: Label[]
}

export interface CreateTaskRequest {
  title: string
  description?: string | null
  status?: TaskStatus
  isFlagged?: boolean
  labelIds?: number[]
}

// PATCH /tasks/{id}: every field optional; only provided ones are applied.
export interface UpdateTaskRequest {
  title?: string
  description?: string | null
  isFlagged?: boolean
  status?: TaskStatus
  labelIds?: number[]
  reorder?: boolean
  afterTaskId?: number | null
}

export interface CreateLabelRequest {
  name: string
  order?: number
}

export interface UpdateLabelRequest {
  name?: string
  order?: number
}
