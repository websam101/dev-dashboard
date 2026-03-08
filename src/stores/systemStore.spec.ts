import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSystemStore } from './systemStore'
import { useSettingsStore } from './settingsStore'
import { api } from '../boot/api';

vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  },
  hasBackend: true
}))

vi.mock('./settingsStore', () => ({
  useSettingsStore: vi.fn().mockImplementation(() => ({
    settings: {
      showSystemStats: true
    }
  }))
}))

describe('System Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.mocked(useSettingsStore).mockReturnValue({
      settings: { showSystemStats: true }
    } as any)
  })

  it('initializes with null stats', () => {
    const store = useSystemStore()
    expect(store.stats).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('fetches stats successfully', async () => {
    const store = useSystemStore()
    const mockStats = { cpuLoad: 10, memPercent: 50 }
    vi.mocked(api.get).mockResolvedValue({ data: mockStats })

    await store.fetchStats()

    expect(store.stats).toEqual(mockStats)
    expect(api.get).toHaveBeenCalledWith('/api/system/stats')
  })

  it('does NOT fetch stats if showSystemStats is false', async () => {
    const store = useSystemStore()
    vi.mocked(useSettingsStore).mockImplementation(() => ({
      settings: { showSystemStats: false }
    } as any))

    await store.fetchStats()

    expect(api.get).not.toHaveBeenCalled()
  })

  it('checks port status', async () => {
    const store = useSystemStore()
    vi.mocked(api.post).mockResolvedValue({ data: { inUse: true } })

    const inUse = await store.checkPort(8080)

    expect(inUse).toBe(true)
    expect(api.post).toHaveBeenCalledWith('/api/utils/check-port', { port: 8080 })
  })

  it('opens task manager', async () => {
    const store = useSystemStore()
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.openTaskManager()

    expect(api.post).toHaveBeenCalledWith('/api/actions/open-task-manager')
  })
})
