import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectsView from './ProjectsView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useProjectsStore } from '../../stores/projectsStore'
import { api } from '../../boot/axios'

vi.mock('../../boot/axios', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}))

describe('ProjectsView', () => {
  let wrapper: any

  beforeEach(() => {
    vi.resetAllMocks()
    wrapper = mount(ProjectsView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          'q-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'q-space': true,
          'q-spinner': true,
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-badge': true,
          'q-icon': true,
          'q-avatar': true,
          'q-tooltip': true,
          'q-dialog': { template: '<div><slot /></div>' },
          'q-input': true,
          'q-card-actions': true
        }
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

  it('does not trigger startScan when path is empty', async () => {
    const projectsStore = useProjectsStore()
    wrapper.vm.scanPath = ''
    await wrapper.vm.startScan()
    expect(projectsStore.scanDirectory).not.toHaveBeenCalled()
  })

  it('handles scan failure', async () => {
    const projectsStore = useProjectsStore()
    vi.mocked(projectsStore.scanDirectory).mockRejectedValue(new Error('Fail'))
    wrapper.vm.scanPath = '/path'
    
    // Should not crash
    await wrapper.vm.startScan()
    expect(projectsStore.scanDirectory).toHaveBeenCalled()
  })

  it('handles git pull', async () => {
    const projectsStore = useProjectsStore()
    const project = { id: '1', name: 'P1', path: '/path', git: {} }
    await wrapper.vm.handleGitPull(project)
    expect(projectsStore.gitPull).toHaveBeenCalledWith('/path')
    expect(wrapper.vm.gitLoading['1pull']).toBe(false)
  })

  it('handles git pull failure', async () => {
    const projectsStore = useProjectsStore()
    vi.mocked(projectsStore.gitPull).mockRejectedValue(new Error('Fail'))
    const project = { id: '1', name: 'P1', path: '/path', git: {} }
    await wrapper.vm.handleGitPull(project)
    expect(wrapper.vm.gitLoading['1pull']).toBe(false)
  })

  it('handles git push', async () => {
    const projectsStore = useProjectsStore()
    const project = { id: '1', name: 'P1', path: '/path', git: {} }
    await wrapper.vm.handleGitPush(project)
    expect(projectsStore.gitPush).toHaveBeenCalledWith('/path')
  })

  it('handles git push failure', async () => {
    const projectsStore = useProjectsStore()
    vi.mocked(projectsStore.gitPush).mockRejectedValue(new Error('Fail'))
    const project = { id: '1', name: 'P1', path: '/path', git: {} }
    await wrapper.vm.handleGitPush(project)
    expect(wrapper.vm.gitLoading['1push']).toBe(false)
  })

  it('handles project deletion', async () => {
    const projectsStore = useProjectsStore()
    wrapper.vm.projectToDelete = { id: '1', name: 'P1' }
    await wrapper.vm.deleteProject()
    
    expect(api.post).toHaveBeenCalledWith('/api/projects/remove', { id: '1' })
    expect(projectsStore.loadProjects).toHaveBeenCalled()
    expect(wrapper.vm.projectToDelete).toBeNull()
  })

  it('returns correct tech icons', () => {
    expect(wrapper.vm.getTechIcon('nodejs')).toBe('javascript')
    expect(wrapper.vm.getTechIcon('vue')).toBe('vuejs')
    expect(wrapper.vm.getTechIcon('quasar')).toBe('extension')
    expect(wrapper.vm.getTechIcon('rust')).toBe('settings_suggest')
    expect(wrapper.vm.getTechIcon('unknown')).toBe('code')
  })
  
  it('handles browse folder in electron', async () => {
    const mockSelect = vi.fn().mockResolvedValue('/selected/path')
    vi.stubGlobal('electronApi', { selectFolder: mockSelect })
    
    // In vue-test-utils, we need to check if window.electronApi is defined
    // The computed property isElectron handles this
    
    await wrapper.vm.browseFolder()
    expect(mockSelect).toHaveBeenCalled()
    expect(wrapper.vm.scanPath).toBe('/selected/path')
    
    vi.unstubAllGlobals()
  })

  it('confirms delete sets correct state', () => {
    const project = { id: '1', name: 'P1' }
    wrapper.vm.confirmDelete(project)
    expect(wrapper.vm.projectToDelete).toEqual(project)
    expect(wrapper.vm.showDeleteDialog).toBe(true)
  })
})
