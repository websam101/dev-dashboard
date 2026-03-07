import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SettingsView from './SettingsView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useSettingsStore } from '../../stores/settingsStore'

describe('SettingsView', () => {
  let wrapper: any

  beforeEach(() => {
    vi.resetAllMocks()
    wrapper = mount(SettingsView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
  })

  it('mounts and loads state', () => {
    const settingsStore = useSettingsStore()
    expect(settingsStore.settings).toBeDefined()
  })

  it('adds a root path correctly', async () => {
    const settingsStore = useSettingsStore()
    wrapper.vm.newRoot = '/new/path'
    await wrapper.vm.addRoot()

    expect(settingsStore.settings.scanRoots).toContain('/new/path')
    expect(wrapper.vm.newRoot).toBe('')
  })

  it('does not add empty root path', async () => {
    const settingsStore = useSettingsStore()
    wrapper.vm.newRoot = ''
    await wrapper.vm.addRoot()
    expect(settingsStore.settings.scanRoots).not.toContain('')
  })

  it('removes a root path correctly', async () => {
    const settingsStore = useSettingsStore()
    settingsStore.settings.scanRoots = ['/path1', '/path2']
    
    await wrapper.vm.removeRoot('/path1')
    expect(settingsStore.settings.scanRoots).not.toContain('/path1')
    expect(settingsStore.settings.scanRoots).toHaveLength(1)
  })

  it('detects electron environment', () => {
    // Should be false by default in vitest unless stubbed
    expect(wrapper.vm.isElectron).toBe(false)
  })
})
