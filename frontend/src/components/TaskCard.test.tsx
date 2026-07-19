import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { Label, Task } from '../api/types'

const labels: Label[] = [
  { id: 1, name: 'bug', order: 0 },
  { id: 2, name: 'urgent', order: 1 },
]

const baseTask: Task = {
  id: 10,
  title: 'Fix login',
  description: 'Users cannot sign in',
  status: 'Todo',
  order: 1000,
  isFlagged: false,
  createdDate: '2026-01-01T00:00:00Z',
  modifiedDate: '2026-01-01T00:00:00Z',
  labels: [labels[0]],
}

function setup(overrides: Partial<Task> = {}) {
  const onUpdate = vi.fn()
  const onDelete = vi.fn()
  const onCreateLabel = vi.fn()
  render(
    <TaskCard
      task={{ ...baseTask, ...overrides }}
      allLabels={labels}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onCreateLabel={onCreateLabel}
    />,
  )
  return { onUpdate, onDelete, onCreateLabel }
}

describe('TaskCard', () => {
  it('renders title, description and attached labels', () => {
    setup()
    expect(screen.getByRole('button', { name: 'task title' })).toHaveTextContent('Fix login')
    expect(screen.getByText('Users cannot sign in')).toBeInTheDocument()
    expect(screen.getByText('bug')).toBeInTheDocument()
  })

  it('flags the task via the flag button', async () => {
    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'flag task' }))
    expect(onUpdate).toHaveBeenCalledWith(10, { isFlagged: true })
  })

  it('shows a red flag icon when flagged', () => {
    setup({ isFlagged: true })
    expect(screen.getByRole('button', { name: 'unflag task' })).toBeInTheDocument()
  })

  it('deletes the task', async () => {
    const { onDelete } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'delete task' }))
    expect(onDelete).toHaveBeenCalledWith(10)
  })

  it('changes status via the dropdown', async () => {
    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('combobox', { name: 'task status' }))
    await userEvent.click(screen.getByRole('option', { name: 'In Progress' }))
    expect(onUpdate).toHaveBeenCalledWith(10, { status: 'InProgress' })
  })

  it('attaches an unattached label from the dropdown', async () => {
    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'edit labels' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /urgent/ }))
    expect(onUpdate).toHaveBeenCalledWith(10, { labelIds: [1, 2] })
  })

  it('removes an attached label from the dropdown', async () => {
    const { onUpdate } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'edit labels' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /bug/ }))
    expect(onUpdate).toHaveBeenCalledWith(10, { labelIds: [] })
  })
})
