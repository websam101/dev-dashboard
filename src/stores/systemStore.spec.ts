import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSystemStore } from './systemStore'
import { api } from '../boot/api';

vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn()
  }
}))

describe('System Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
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

  it('handles fetch stats failure', async () => {
    const store = useSystemStore()
    vi.mocked(api.get).mockRejectedValue(new Error('Fetch failed'))

    await store.fetchStats()

    expect(store.stats).toBeNull()
  })
})
