import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { api } from './api/client'
import type { Task } from './api/types'

vi.mock('./api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/client')>()
  return {
    ...actual,
    api: {
      getTasks: vi.fn(),
      getLabels: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      createLabel: vi.fn(),
      updateLabel: vi.fn(),
      deleteLabel: vi.fn(),
    },
  }
})

const mockApi = vi.mocked(api)

const task = (over: Partial<Task>): Task => ({
  id: 1,
  title: 'Task',
  description: null,
  status: 'Todo',
  order: 1000,
  isFlagged: false,
  createdDate: '2026-01-01T00:00:00Z',
  modifiedDate: '2026-01-01T00:00:00Z',
  labels: [],
  ...over,
})

describe('App board', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getLabels.mockResolvedValue([])
  })

  it('renders three columns with tasks in the right place', async () => {
    mockApi.getTasks.mockResolvedValue([
      task({ id: 1, title: 'Alpha', status: 'Todo' }),
      task({ id: 2, title: 'Beta', status: 'Done' }),
    ])
    render(<App />)

    const todo = await screen.findByRole('region', { name: 'To-do column' })
    const done = screen.getByRole('region', { name: 'Done column' })
    expect(within(todo).getByText('Alpha')).toBeInTheDocument()
    expect(within(done).getByText('Beta')).toBeInTheDocument()
    expect(within(todo).queryByText('Beta')).not.toBeInTheDocument()
  })

  it('adds a task to the target column', async () => {
    mockApi.getTasks.mockResolvedValue([])
    mockApi.createTask.mockResolvedValue(task({ id: 9, title: 'Fresh', status: 'InProgress' }))
    render(<App />)

    const col = await screen.findByRole('region', { name: 'In Progress column' })
    await userEvent.type(within(col).getByRole('textbox', { name: 'new task title' }), 'Fresh')
    await userEvent.click(within(col).getByRole('button', { name: /add/i }))

    expect(mockApi.createTask).toHaveBeenCalledWith({ title: 'Fresh', status: 'InProgress' })
    await waitFor(() => expect(within(col).getByText('Fresh')).toBeInTheDocument())
  })

  it('shows an error alert when loading fails', async () => {
    mockApi.getTasks.mockRejectedValue(new Error('boom'))
    render(<App />)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
