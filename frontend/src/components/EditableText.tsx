import { useEffect, useRef, useState } from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'

interface EditableTextProps {
  value: string
  placeholder?: string
  multiline?: boolean
  required?: boolean
  variant?: TypographyProps['variant']
  color?: TypographyProps['color']
  ariaLabel: string
  /** Called on click-off only when the trimmed value actually changed. */
  onCommit: (next: string) => void
}

/**
 * Click the text to edit it in place; on blur (click-off) it commits only if
 * the value changed. Enter commits single-line fields; Escape cancels.
 * A `required` field refuses to commit an empty value and reverts instead.
 */
export function EditableText({
  value,
  placeholder,
  multiline = false,
  required = false,
  variant = 'body1',
  color,
  ariaLabel,
  onCommit,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the draft in sync if the underlying value changes while not editing.
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  const start = () => {
    setDraft(value)
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (required && trimmed === '') return // revert: keep old value
    if (trimmed !== value.trim()) onCommit(trimmed)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <TextField
        inputRef={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !multiline) {
            e.preventDefault()
            commit()
          } else if (e.key === 'Escape') {
            cancel()
          }
        }}
        autoFocus
        fullWidth
        multiline={multiline}
        size="small"
        variant="outlined"
        placeholder={placeholder}
        inputProps={{ 'aria-label': ariaLabel }}
      />
    )
  }

  const isEmpty = value.trim() === ''
  return (
    <Typography
      variant={variant}
      color={isEmpty ? 'text.disabled' : color}
      onClick={start}
      sx={{
        cursor: 'text',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
        px: 0.5,
        minHeight: '1.2em',
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          start()
        }
      }}
    >
      {isEmpty ? placeholder : value}
    </Typography>
  )
}
