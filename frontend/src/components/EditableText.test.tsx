import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditableText } from './EditableText'

describe('EditableText', () => {
  it('commits the trimmed value on blur when it changed', async () => {
    const onCommit = vi.fn()
    render(<EditableText value="Old" ariaLabel="title" onCommit={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: 'title' }))
    const input = screen.getByRole('textbox', { name: 'title' })
    await userEvent.clear(input)
    await userEvent.type(input, '  New  ')
    await userEvent.tab()

    expect(onCommit).toHaveBeenCalledExactlyOnceWith('New')
  })

  it('does not commit when the value is unchanged', async () => {
    const onCommit = vi.fn()
    render(<EditableText value="Same" ariaLabel="title" onCommit={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: 'title' }))
    await userEvent.tab()

    expect(onCommit).not.toHaveBeenCalled()
  })

  it('reverts an emptied required field without committing', async () => {
    const onCommit = vi.fn()
    render(<EditableText value="Keep" required ariaLabel="title" onCommit={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: 'title' }))
    await userEvent.clear(screen.getByRole('textbox', { name: 'title' }))
    await userEvent.tab()

    expect(onCommit).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'title' })).toHaveTextContent('Keep')
  })
})
