import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from './settingsStore'
import { api } from '../boot/api'
import { agnosticDataService } from '../services/db/AgnosticDataService'

vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} })
  },
  hasBackend: true
}))

vi.mock('../services/db/AgnosticDataService', () => ({
  agnosticDataService: {
    getSetting: vi.fn(),
    setSetting: vi.fn()
  }
}))

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('initializes with default settings', () => {
    const store = useSettingsStore()
    expect(store.settings.darkMode).toBe(true)
    expect(store.settings.showSystemStats).toBe(true)
  })

  it('loads settings successfully', async () => {
    const store = useSettingsStore()
    vi.mocked(agnosticDataService.getSetting).mockResolvedValue({ darkMode: false, showSystemStats: false })
    
    await store.loadSettings()

    expect(store.settings.darkMode).toBe(false)
    expect(store.settings.showSystemStats).toBe(false)
  })

  it('saves settings successfully', async () => {
    const store = useSettingsStore()
    store.settings.darkMode = false
    
    await store.saveSettings()

    expect(agnosticDataService.setSetting).toHaveBeenCalledWith('app_settings', expect.objectContaining({ darkMode: false }))
  })
})
