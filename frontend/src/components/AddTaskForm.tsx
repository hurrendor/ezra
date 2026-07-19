import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add'

interface AddTaskFormProps {
  onAdd: (title: string) => void
}

/** Compact per-column "add a task" input; commits on Enter or the Add button. */
export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('')

  const submit = () => {
    const trimmed = title.trim()
    if (trimmed === '') return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        placeholder="Add a task…"
        size="small"
        fullWidth
        inputProps={{ 'aria-label': 'new task title' }}
      />
      <Button
        onClick={submit}
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        disabled={title.trim() === ''}
      >
        Add
      </Button>
    </Box>
  )
}
