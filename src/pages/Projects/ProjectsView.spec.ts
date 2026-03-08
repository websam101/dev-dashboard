import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectsView from './ProjectsView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useProjectsStore } from '../../stores/projectsStore'
import { api } from '../../boot/api';

vi.mock('../../boot/api', () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: { success: true } })),
    post: vi.fn(() => Promise.resolve({ data: { success: true } }))
  },
  hasBackend: true
}))

describe('ProjectsView', () => {
  let wrapper: any

  beforeEach(() => {
    vi.resetAllMocks()
    wrapper = mount(ProjectsView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
  })

  it('mounts and loads projects', () => {
    const projectsStore = useProjectsStore()
    expect(projectsStore.loadProjects).toHaveBeenCalled()
  })

  it('triggers startScan when path is provided', async () => {
    const projectsStore = useProjectsStore()
    wrapper.vm.scanPath = '/path'
    await wrapper.vm.startScan()
    expect(projectsStore.scanDirectory).toHaveBeenCalledWith('/path')
  })

  it('handles scan failure', async () => {
    const projectsStore = useProjectsStore()
    vi.mocked(projectsStore.scanDirectory).mockRejectedValue(new Error('Fail'))
    wrapper.vm.scanPath = '/path'
    
    try {
      await wrapper.vm.startScan()
    } catch (e) {
      // Expected rejection
    }
    expect(projectsStore.scanDirectory).toHaveBeenCalled()
  })

  it('handles git pull', async () => {
    const projectsStore = useProjectsStore()
    const project = { id: '1', name: 'P1', path: '/path', git: {} }
    await wrapper.vm.handleGitPull(project)
    expect(projectsStore.gitPull).toHaveBeenCalledWith('/path')
  })

  it('handles project deletion', async () => {
    wrapper.vm.projectToDelete = { id: '1', name: 'P1' }
    await wrapper.vm.deleteProject()
    expect(api.post).toHaveBeenCalledWith('/api/projects/remove', { id: '1' })
  })

  it('returns correct tech icons', () => {
    expect(wrapper.vm.getTechIcon('nodejs')).toBe('mdi-nodejs')
    expect(wrapper.vm.getTechIcon('vue')).toBe('mdi-vuejs')
    expect(wrapper.vm.getTechIcon('quasar')).toBe('mdi-lightning-bolt')
  })

  it('confirms delete sets correct state', () => {
    const project = { id: '1', name: 'P1' }
    wrapper.vm.confirmDelete(project)
    expect(wrapper.vm.projectToDelete).toEqual(project)
    expect(wrapper.vm.showDeleteDialog).toBe(true)
  })
})
