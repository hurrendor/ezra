import type {
  CreateLabelRequest,
  CreateTaskRequest,
  Label,
  Task,
  UpdateLabelRequest,
  UpdateTaskRequest,
} from './types'

// Base is empty by default: the Vite dev-proxy (and, in Docker, the nginx
// reverse-proxy) forwards /tasks and /labels to the API. Override with
// VITE_API_BASE for a fully-separate origin.
const BASE = import.meta.env.VITE_API_BASE ?? ''

/** Error carrying the server's { error } message and HTTP status. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError('Could not reach the server.', 0)
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (body: CreateTaskRequest) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: number, body: UpdateTaskRequest) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id: number) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),

  getLabels: () => request<Label[]>('/labels'),
  createLabel: (body: CreateLabelRequest) =>
    request<Label>('/labels', { method: 'POST', body: JSON.stringify(body) }),
  updateLabel: (id: number, body: UpdateLabelRequest) =>
    request<Label>(`/labels/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteLabel: (id: number) =>
    request<void>(`/labels/${id}`, { method: 'DELETE' }),
}
