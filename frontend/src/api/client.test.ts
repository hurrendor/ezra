import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from './client'

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const mockFetch = () => globalThis.fetch as unknown as ReturnType<typeof vi.fn>

  it('GET /tasks returns parsed JSON', async () => {
    mockFetch().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 1, title: 'A' }],
    })
    const tasks = await api.getTasks()
    expect(tasks).toEqual([{ id: 1, title: 'A' }])
    expect(mockFetch()).toHaveBeenCalledWith('/tasks', expect.objectContaining({}))
  })

  it('POST sends a JSON body and method', async () => {
    mockFetch().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 5 }) })
    await api.createTask({ title: 'New' })
    const [, init] = mockFetch().mock.calls[0]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ title: 'New' })
  })

  it('DELETE handles 204 with no body', async () => {
    mockFetch().mockResolvedValue({ ok: true, status: 204 })
    await expect(api.deleteTask(1)).resolves.toBeUndefined()
  })

  it('surfaces the server { error } message on failure', async () => {
    mockFetch().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Title is required.' }),
    })
    await expect(api.createTask({ title: '' })).rejects.toMatchObject({
      message: 'Title is required.',
      status: 400,
    } satisfies Partial<ApiError>)
  })

  it('wraps network failures as ApiError with status 0', async () => {
    mockFetch().mockRejectedValue(new TypeError('network down'))
    await expect(api.getTasks()).rejects.toBeInstanceOf(ApiError)
  })
})
