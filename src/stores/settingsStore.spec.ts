import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from './settingsStore'
import { api } from '../boot/api'

// Hoist mock
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getSetting: vi.fn(),
    setSetting: vi.fn()
  }
}))

vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}))

vi.mock('../services/db/adapter/IndexedDbAdapter', () => {
  return {
    IndexedDbAdapter: vi.fn().mockImplementation(function() {
      return mockDb
    })
  }
})

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('initializes with default settings', () => {
    const store = useSettingsStore()
    expect(store.settings.darkMode).toBe(true)
  })

  it('loads settings successfully', async () => {
    const store = useSettingsStore()
    mockDb.getSetting.mockResolvedValue({ darkMode: false, scanRoots: ['/path'] })
    
    await store.loadSettings()

    expect(store.settings.darkMode).toBe(false)
    expect(store.settings.scanRoots).toContain('/path')
  })

  it('saves settings successfully', async () => {
    const store = useSettingsStore()
    store.settings.darkMode = false
    
    await store.saveSettings()

    expect(mockDb.setSetting).toHaveBeenCalled()
    expect(api.post).toHaveBeenCalledWith('/api/settings', expect.objectContaining({ darkMode: false }))
  })
})
