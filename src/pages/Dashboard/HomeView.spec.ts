import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomeView from './HomeView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useSystemStore } from '../../stores/systemStore'
import { useProjectsStore } from '../../stores/projectsStore'
import { useBookmarksStore } from '../../stores/bookmarksStore'

vi.mock('../../boot/api', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: { success: true } })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } }))
  },
  default: {
    get: vi.fn(() => Promise.resolve({ data: { success: true } })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } }))
  }
}))

describe('HomeView', () => {
  let wrapper: any

  beforeEach(() => {
    vi.resetAllMocks()
    wrapper = mount(HomeView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
  })

  it('mounts and calls load actions', () => {
    const systemStore = useSystemStore()
    const projectsStore = useProjectsStore()
    const bookmarksStore = useBookmarksStore()
    
    expect(systemStore.fetchStats).toHaveBeenCalled()
    expect(projectsStore.loadProjects).toHaveBeenCalled()
    expect(bookmarksStore.loadBookmarks).toHaveBeenCalled()
  })

  it('calculates totals and recent projects', () => {
    const projectsStore = useProjectsStore()
    const bookmarksStore = useBookmarksStore()
    
    projectsStore.projects = [
      { id: '1', name: 'P1', techs: [] },
      { id: '2', name: 'P2', techs: [] },
      { id: '3', name: 'P3', techs: [] },
      { id: '4', name: 'P4', techs: [] }
    ] as any
    bookmarksStore.bookmarks = [{ id: '1', title: 'B1' }] as any

    expect(wrapper.vm.totalProjects).toBe(4)
    expect(wrapper.vm.recentProjects).toHaveLength(4)
    expect(wrapper.vm.totalBookmarks).toBe(1)
  })

  it('formats uptime correctly', () => {
    expect(wrapper.vm.formatUptime(3600)).toBe('1h 0m')
    expect(wrapper.vm.formatUptime(24 * 3600 + 3600)).toBe('25h 0m')
  })

  it('opens VS Code via store', async () => {
    const projectsStore = useProjectsStore()
    wrapper.vm.openVsCode('/test/path')
    expect(projectsStore.openVsCode).toHaveBeenCalledWith('/test/path')
  })
})
