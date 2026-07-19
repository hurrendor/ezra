import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import CloseIcon from '@mui/icons-material/Close'
import FlagIcon from '@mui/icons-material/Flag'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { EditableText } from './EditableText'
import { LabelChips } from './LabelChips'
import { STATUSES, STATUS_LABELS } from '../api/types'
import type { Label, Task, TaskStatus, UpdateTaskRequest } from '../api/types'

interface TaskCardProps {
  task: Task
  allLabels: Label[]
  onUpdate: (id: number, patch: UpdateTaskRequest) => void
  onDelete: (id: number) => void
  onCreateLabel: (name: string) => Promise<Label | undefined>
}

export function TaskCard({ task, allLabels, onUpdate, onDelete, onCreateLabel }: TaskCardProps) {
  const toggleLabel = (labelId: number, attach: boolean) => {
    const ids = new Set(task.labels.map((l) => l.id))
    if (attach) ids.add(labelId)
    else ids.delete(labelId)
    onUpdate(task.id, { labelIds: [...ids] })
  }

  return (
    <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
      <CardContent sx={{ pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <EditableText
              value={task.title}
              required
              variant="subtitle1"
              ariaLabel="task title"
              placeholder="Title"
              onCommit={(title) => onUpdate(task.id, { title })}
            />
          </Box>
          <Tooltip title={task.isFlagged ? 'Remove flag' : 'Flag task'}>
            <IconButton
              size="small"
              aria-label={task.isFlagged ? 'unflag task' : 'flag task'}
              onClick={() => onUpdate(task.id, { isFlagged: !task.isFlagged })}
            >
              {task.isFlagged ? (
                <FlagIcon fontSize="small" color="error" />
              ) : (
                <FlagOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete task">
            <IconButton size="small" aria-label="delete task" onClick={() => onDelete(task.id)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mt: 0.5 }}>
          <EditableText
            value={task.description ?? ''}
            multiline
            variant="body2"
            color="text.secondary"
            ariaLabel="task description"
            placeholder="Add a description…"
            onCommit={(description) => onUpdate(task.id, { description: description || null })}
          />
        </Box>

        <Box sx={{ mt: 1 }}>
          <LabelChips
            taskLabels={task.labels}
            allLabels={allLabels}
            onToggle={toggleLabel}
            onCreateLabel={onCreateLabel}
          />
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControl size="small">
            <Select
              value={task.status}
              onChange={(e) => onUpdate(task.id, { status: e.target.value as TaskStatus })}
              inputProps={{ 'aria-label': 'task status' }}
              sx={{ minWidth: 130 }}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}
