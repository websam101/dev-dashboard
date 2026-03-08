import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjectsStore } from './projectsStore'
import { api } from '../boot/api'
import { agnosticDataService } from '../services/db/AgnosticDataService'

// Mock dependencies
vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({ data: {} })
  },
  hasBackend: true
}))

vi.mock('../services/db/AgnosticDataService', () => ({
  agnosticDataService: {
    getProjects: vi.fn().mockResolvedValue([]),
    saveProject: vi.fn().mockResolvedValue(undefined),
    deleteProject: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('Projects Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
  })

  it('initializes with empty projects', () => {
    const store = useProjectsStore()
    expect(store.projects).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('loads projects from local agnostic service', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [
      { id: '1', name: 'Local', path: '/path', description: '', techs: [], ports: [], managedPorts: [], favorite: false }
    ]
    
    vi.mocked(agnosticDataService.getProjects).mockResolvedValue(mockLocalProjects as any)

    await store.loadProjects()

    expect(store.projects[0]).toEqual(expect.objectContaining({
      id: '1',
      name: 'Local'
    }))
  })

  it('toggles favorite status', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', description: '', techs: [], ports: [], managedPorts: [], favorite: false }]
    
    await store.toggleFavorite('1')
    expect(store.projects[0]!.favorite).toBe(true)
    expect(agnosticDataService.saveProject).toHaveBeenCalled()
  })

  it('adds manual project', async () => {
    const store = useProjectsStore()
    await store.addManualProject({ name: 'Manual', path: '/man', description: '', techs: [] })
    
    expect(store.projects).toHaveLength(1)
    expect(store.projects[0]!.name).toBe('Manual')
    expect(agnosticDataService.saveProject).toHaveBeenCalled()
  })

  it('deletes project', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', description: '', techs: [], ports: [], managedPorts: [] }]
    
    await store.deleteProject('1')
    
    expect(store.projects).toHaveLength(0)
    expect(agnosticDataService.deleteProject).toHaveBeenCalledWith('1')
  })

  it('performs syncAll correctly with guard', async () => {
    const store = useProjectsStore()
    vi.mocked(api.post).mockResolvedValue({ data: [{ id: '1', name: 'S' }] })

    // First call
    const p1 = store.syncAll()
    // Second call should be ignored by guard
    const p2 = store.syncAll()
    
    await Promise.all([p1, p2])

    expect(api.post).toHaveBeenCalledTimes(1)
  })
})
