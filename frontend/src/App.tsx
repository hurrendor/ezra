import { useCallback, useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { Column } from './components/Column'
import { api, ApiError } from './api/client'
import { STATUSES } from './api/types'
import type { Label, Task, TaskStatus, UpdateTaskRequest } from './api/types'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const fail = useCallback((e: unknown) => {
    setToast(e instanceof ApiError ? e.message : 'Something went wrong.')
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [t, l] = await Promise.all([api.getTasks(), api.getLabels()])
      setTasks(t)
      setLabels(l)
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : 'Failed to load the board.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addTask = useCallback(
    async (status: TaskStatus, title: string) => {
      try {
        const created = await api.createTask({ title, status })
        setTasks((prev) => [...prev, created])
      } catch (e) {
        fail(e)
      }
    },
    [fail],
  )

  const updateTask = useCallback(
    async (id: number, patch: UpdateTaskRequest) => {
      try {
        const updated = await api.updateTask(id, patch)
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      } catch (e) {
        fail(e)
      }
    },
    [fail],
  )

  const deleteTask = useCallback(
    async (id: number) => {
      // Optimistic: drop it immediately, restore on failure.
      const prev = tasks
      setTasks((cur) => cur.filter((t) => t.id !== id))
      try {
        await api.deleteTask(id)
      } catch (e) {
        setTasks(prev)
        fail(e)
      }
    },
    [tasks, fail],
  )

  const createLabel = useCallback(
    async (name: string): Promise<Label | undefined> => {
      try {
        const created = await api.createLabel({ name })
        setLabels((prev) => [...prev, created])
        return created
      } catch (e) {
        fail(e)
        return undefined
      }
    },
    [fail],
  )

  const tasksFor = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order || a.id - b.id)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1">
            Ezra - Task management
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : loadError ? (
          <Alert
            severity="error"
            action={
              <Box component="button" onClick={() => void load()} sx={{ cursor: 'pointer' }}>
                Retry
              </Box>
            }
          >
            {loadError}
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              alignItems: 'start',
            }}
          >
            {STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasksFor(status)}
                allLabels={labels}
                onAdd={addTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onCreateLabel={createLabel}
              />
            ))}
          </Box>
        )}
      </Box>

      <Snackbar
        open={toast !== null}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  )
}
