import { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { TaskCard } from './TaskCard'
import { AddTaskForm } from './AddTaskForm'
import { STATUS_LABELS } from '../api/types'
import type { Label, Task, TaskStatus, UpdateTaskRequest } from '../api/types'

interface ColumnProps {
  status: TaskStatus
  tasks: Task[]
  allLabels: Label[]
  onAdd: (status: TaskStatus, title: string) => void
  onUpdate: (id: number, patch: UpdateTaskRequest) => void
  onDelete: (id: number) => void
  onCreateLabel: (name: string) => Promise<Label | undefined>
}

export function Column({
  status,
  tasks,
  allLabels,
  onAdd,
  onUpdate,
  onDelete,
  onCreateLabel,
}: ColumnProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!dragOver) setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const id = Number(e.dataTransfer.getData('text/plain'))
    if (!id || tasks.some((t) => t.id === id)) return
    onUpdate(id, { status })
  }

  const handleDropRelative = (draggedId: number, anchorId: number, place: 'before' | 'after') => {
    if (draggedId === anchorId) return
    const rest = tasks.filter((t) => t.id !== draggedId)
    const idx = rest.findIndex((t) => t.id === anchorId)
    if (idx < 0) return
    const afterTaskId = place === 'after' ? anchorId : idx > 0 ? rest[idx - 1].id : null
    onUpdate(draggedId, { status, reorder: true, afterTaskId })
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: dragOver ? 'action.hover' : 'grey.100',
        outline: dragOver ? '2px dashed' : 'none',
        outlineColor: 'primary.main',
        p: 1.5,
        borderRadius: 2,
        height: '100%',
      }}
      aria-label={`${STATUS_LABELS[status]} column`}
      component="section"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
        <Typography variant="h6" component="h2">
          {STATUS_LABELS[status]}
        </Typography>
        <Chip label={tasks.length} size="small" />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <AddTaskForm onAdd={(title) => onAdd(status, title)} />
      </Box>

      <Stack spacing={1.5}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            allLabels={allLabels}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCreateLabel={onCreateLabel}
            onDropRelative={handleDropRelative}
          />
        ))}
      </Stack>
    </Paper>
  )
}
