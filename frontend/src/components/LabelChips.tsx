import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { Label } from '../api/types'

interface LabelChipsProps {
  taskLabels: Label[]
  allLabels: Label[]
  onToggle: (labelId: number, attach: boolean) => void
  onCreateLabel: (name: string) => Promise<Label | undefined>
}

/**
 * Renders a task's labels as chips. Clicking a chip — or the "add label"
 * button — opens a dropdown listing every label with a checkbox to
 * attach/remove it, plus an inline field to create a new label on the fly.
 */
export function LabelChips({ taskLabels, allLabels, onToggle, onCreateLabel }: LabelChipsProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [newName, setNewName] = useState('')
  const open = Boolean(anchor)
  const attachedIds = new Set(taskLabels.map((l) => l.id))

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)
  const closeMenu = () => {
    setAnchor(null)
    setNewName('')
  }

  const create = async () => {
    const name = newName.trim()
    if (name === '') return
    const created = await onCreateLabel(name)
    if (created) onToggle(created.id, true)
    setNewName('')
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {taskLabels.map((label) => (
        <Chip
          key={label.id}
          label={label.name}
          size="small"
          onClick={openMenu}
          aria-label={`label ${label.name}`}
        />
      ))}
      <Tooltip title="Add or remove labels">
        <IconButton size="small" onClick={openMenu} aria-label="edit labels">
          <LabelOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchor} open={open} onClose={closeMenu}>
        {allLabels.length === 0 && (
          <MenuItem disabled>No labels yet</MenuItem>
        )}
        {allLabels.map((label) => {
          const attached = attachedIds.has(label.id)
          return (
            <MenuItem
              key={label.id}
              onClick={() => onToggle(label.id, !attached)}
              dense
            >
              <Checkbox edge="start" checked={attached} tabIndex={-1} disableRipple size="small" />
              <ListItemText primary={label.name} />
            </MenuItem>
          )
        })}
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void create()
              }
              e.stopPropagation() // keep Menu's typeahead from stealing keys
            }}
            placeholder="New label…"
            size="small"
            fullWidth
            inputProps={{ 'aria-label': 'new label name' }}
          />
        </Box>
      </Menu>
    </Box>
  )
}
