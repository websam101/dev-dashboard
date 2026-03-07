import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjectsStore } from './projectsStore'
import { api } from '../boot/api'

// Hoist the mock data so it's available inside vi.mock
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getProjects: vi.fn().mockResolvedValue([]),
    addProject: vi.fn().mockResolvedValue(undefined),
    deleteProject: vi.fn().mockResolvedValue(undefined)
  }
}))

// Mock dependencies
vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn(),
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

  it('loads projects from local and syncs with backend', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [
      { id: '1', name: 'Local', path: '/path', description: '' }
    ]
    const mockRemoteProjects = [{ id: '1', name: 'Remote', path: '/path', description: '', techs: ['vue'], git: {}, ports: [] }]
    
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockResolvedValue({ data: mockRemoteProjects })

    await store.loadProjects()

    // It should merge and contain managedPorts
    expect(store.projects[0]).toEqual(expect.objectContaining({
      id: '1',
      name: 'Remote',
      managedPorts: []
    }))
  })

  it('toggles favorite status', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', description: '', techs: [], ports: [], managedPorts: [], favorite: false }]
    
    await store.toggleFavorite('1')
    expect(store.projects[0]!.favorite).toBe(true)
    expect(mockDb.addProject).toHaveBeenCalled()
    expect(api.post).toHaveBeenCalledWith('/api/projects/update', expect.any(Object))
  })

  it('forcePushToBackend calls sync endpoint', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', description: '', techs: [], ports: [], managedPorts: [] }]

    await store.forcePushToBackend()

    expect(api.post).toHaveBeenCalledWith('/api/projects/sync', expect.any(Array))
  })

  it('forcePullFromBackend clears and replaces local projects', async () => {
    const store = useProjectsStore()
    const mockRemote = [{ id: 'rem1', name: 'Remote', path: '/rem', description: '' }]
    
    mockDb.getProjects.mockResolvedValue([{ id: 'old', name: 'Old', path: '/old', description: '', techs: [], ports: [] }] as any)
    vi.mocked(api.get).mockResolvedValue({ data: mockRemote })

    await store.forcePullFromBackend()

    expect(mockDb.deleteProject).toHaveBeenCalledWith('old')
    expect(mockDb.addProject).toHaveBeenCalledWith(expect.objectContaining({ id: 'rem1' }))
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
