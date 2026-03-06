import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import HomeView from './HomeView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useSystemStore } from '../../stores/systemStore'
import { useProjectsStore } from '../../stores/projectsStore'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { api } from '../../boot/axios'

vi.mock('../../boot/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { cpuLoad: 0 } })
  }
}))

describe('HomeView', () => {
  let wrapper: any

  beforeEach(() => {
    vi.useFakeTimers()
    wrapper = mount(HomeView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          'q-icon': true,
          'q-badge': true,
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-circular-progress': true,
          'q-separator': true,
          'q-spinner': true,
          'q-spinner-grid': true,
          'q-btn': true,
          'q-space': true
        }
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('mounts and sets mounted state to true', () => {
    expect(wrapper.vm.mounted).toBe(true)
  })

  it('shows backend status correctly when online', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } })
    
    const w = mount(HomeView, {
      global: { plugins: [createTestingPinia()], stubs: { 'q-page': true, 'q-badge': true, 'q-icon': true, 'q-card': true, 'q-card-section': true, 'q-circular-progress': true, 'q-separator': true, 'q-spinner': true, 'q-spinner-grid': true, 'q-btn': true, 'q-space': true } }
    })
    
    // Wait for the first ping in onMounted
    await vi.advanceTimersByTimeAsync(0)
    await w.vm.$nextTick()
    
    expect((w.vm as any).backendOnline).toBe(true)
  })

  it('handles backend offline', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Offline'))
    
    const w = mount(HomeView, {
      global: { plugins: [createTestingPinia()], stubs: { 'q-page': true, 'q-badge': true, 'q-icon': true, 'q-card': true, 'q-card-section': true, 'q-circular-progress': true, 'q-separator': true, 'q-spinner': true, 'q-spinner-grid': true, 'q-btn': true, 'q-space': true } }
    })
    
    await vi.advanceTimersByTimeAsync(0)
    await w.vm.$nextTick()
    
    expect((w.vm as any).backendOnline).toBe(false)
  })

  it('calculates totals and recent projects', async () => {
    const projectsStore = useProjectsStore()
    const bookmarksStore = useBookmarksStore()
    
    projectsStore.projects = [
      { id: '1', name: 'P1', path: '/p1', techs: [] },
      { id: '2', name: 'P2', path: '/p2', techs: [] },
      { id: '3', name: 'P3', path: '/p3', techs: [] },
      { id: '4', name: 'P4', path: '/p4', techs: [] }
    ] as any
    
    bookmarksStore.bookmarks = [
      { id: '1', title: 'B1', url: 'u1', category: 'C1' }
    ] as any

    expect(wrapper.vm.totalProjects).toBe(4)
    expect(wrapper.vm.recentProjects).toHaveLength(3)
    expect(wrapper.vm.totalBookmarks).toBe(1)
  })

  it('formats uptime correctly', () => {
    expect(wrapper.vm.formatUptime(3600)).toBe('1h')
    expect(wrapper.vm.formatUptime(24 * 3600 + 3600)).toBe('1d 1h')
    expect(wrapper.vm.formatUptime(0)).toBe('0h')
  })

  it('opens VS Code via store', () => {
    const projectsStore = useProjectsStore()
    wrapper.vm.openVsCode('/path')
    expect(projectsStore.openVsCode).toHaveBeenCalledWith('/path')
  })

  it('handles polling interval correctly', async () => {
    const systemStore = useSystemStore()
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } })
    
    await vi.advanceTimersByTimeAsync(5000)
    expect(systemStore.fetchStats).toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    wrapper.unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
