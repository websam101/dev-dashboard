import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SettingsView from './SettingsView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useSettingsStore } from '../../stores/settingsStore'

describe('SettingsView', () => {
  let wrapper: any

  const createWrapper = (electron = false) => {
    if (electron) {
      vi.stubGlobal('electronApi', { selectFolder: vi.fn().mockResolvedValue('/path') })
    } else {
      vi.stubGlobal('electronApi', undefined)
    }
    
    return mount(SettingsView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-list': { template: '<div><slot /></div>' },
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div><slot /></div>' },
          'q-item-label': { template: '<div><slot /></div>' },
          'q-icon': true,
          'q-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'q-input': { template: '<input v-model="modelValue" @keyup.enter="$emit(\'keyup.enter\')" />', props: ['modelValue'] },
          'q-toggle': { template: '<input type="checkbox" :checked="modelValue" @update:modelValue="$emit(\'update:modelValue\', $event)" />', props: ['modelValue'] },
          'q-spinner-cube': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('electronApi', undefined)
    wrapper = createWrapper(false)
  })

  it('mounts and loads settings', () => {
    const settingsStore = useSettingsStore()
    expect(settingsStore.loadSettings).toHaveBeenCalled()
  })

  it('adds a root path correctly', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.settings.scanRoots = []
    
    wrapper.vm.newRoot = '/new/path'
    wrapper.vm.addRoot()
    
    expect(settingsStore.settings.scanRoots).toContain('/new/path')
    expect(settingsStore.saveSettings).toHaveBeenCalled()
    expect(wrapper.vm.newRoot).toBe('')
  })

  it('does not add empty root path', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.settings.scanRoots = []
    
    wrapper.vm.newRoot = ''
    wrapper.vm.addRoot()
    
    expect(settingsStore.settings.scanRoots).toHaveLength(0)
    expect(settingsStore.saveSettings).not.toHaveBeenCalled()
  })

  it('does not add duplicate root path', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.settings.scanRoots = ['/existing']
    
    wrapper.vm.newRoot = '/existing'
    wrapper.vm.addRoot()
    
    expect(settingsStore.settings.scanRoots).toHaveLength(1)
  })

  it('removes a root path correctly', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.settings.scanRoots = ['/path1', '/path2']
    
    // Simulate UI interaction if possible, or direct call
    wrapper.vm.removeRoot('/path1')
    
    expect(settingsStore.settings.scanRoots).not.toContain('/path1')
    expect(settingsStore.settings.scanRoots).toHaveLength(1)
    expect(settingsStore.saveSettings).toHaveBeenCalled()
  })

  it('handles browse folder in electron', async () => {
    const w = createWrapper(true)
    const settingsStore = useSettingsStore()
    settingsStore.settings.scanRoots = []
    
    await w.vm.browseFolder()
    
    expect(window.electronApi.selectFolder).toHaveBeenCalled()
    expect(settingsStore.settings.scanRoots).toContain('/path')
    
    vi.unstubAllGlobals()
  })

  it('triggers saveSettings and notification', () => {
    const settingsStore = useSettingsStore()
    wrapper.vm.saveSettings()
    expect(settingsStore.saveSettings).toHaveBeenCalled()
  })

  it('detects electron environment', () => {
    const w = createWrapper(true)
    expect(w.vm.isElectron).toBe(true)
    vi.unstubAllGlobals()
  })
})
