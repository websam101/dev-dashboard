import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from './settingsStore'
import { api } from '../boot/axios'

vi.mock('../boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
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
    expect(store.loading).toBe(false)
  })

  it('loads settings successfully', async () => {
    const store = useSettingsStore()
    const mockSettings = { darkMode: false, scanRoots: ['/path'] }
    vi.mocked(api.get).mockResolvedValue({ data: mockSettings })

    await store.loadSettings()

    expect(store.settings.darkMode).toBe(false)
    expect(store.settings.scanRoots).toEqual(['/path'])
    expect(store.settings.autoCheckPorts).toBe(true) // preserved
  })

  it('handles load settings with empty response', async () => {
    const store = useSettingsStore()
    vi.mocked(api.get).mockResolvedValue({ data: null })

    await store.loadSettings()

    expect(store.settings.darkMode).toBe(true)
  })

  it('handles load settings failure', async () => {
    const store = useSettingsStore()
    vi.mocked(api.get).mockRejectedValue(new Error('Load failed'))

    await store.loadSettings()

    expect(store.settings.darkMode).toBe(true)
    expect(store.loading).toBe(false)
  })

  it('saves settings successfully', async () => {
    const store = useSettingsStore()
    store.settings.darkMode = false
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.saveSettings()

    expect(api.post).toHaveBeenCalledWith('/api/settings', store.settings)
  })

  it('handles save settings failure', async () => {
    const store = useSettingsStore()
    vi.mocked(api.post).mockRejectedValue(new Error('Save failed'))

    await store.saveSettings()
    // No state change expected, just coverage for catch block
  })
})
