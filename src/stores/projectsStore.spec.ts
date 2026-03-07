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
    post: vi.fn()
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
  })

  it('initializes with empty projects', () => {
    const store = useProjectsStore()
    expect(store.projects).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('loads projects from local and syncs with backend', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [
      { id: '1', name: 'Local', path: '/path' }
    ]
    const mockRemoteProjects = [{ id: '1', name: 'Remote', path: '/path', techs: ['vue'], git: {}, ports: [] }]
    
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

  it('handles backend sync failure during loadProjects', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [{ id: '1', name: 'Local', path: '/path' }]
    
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockRejectedValue(new Error('Sync failed'))

    await store.loadProjects()

    expect(store.projects[0]).toEqual(expect.objectContaining({
      id: '1',
      name: 'Local',
      managedPorts: []
    }))
  })

  it('scans directory and updates state/local storage', async () => {
    const store = useProjectsStore()
    const mockFoundProjects = [
      { id: '2', name: 'New', path: '/new', techs: [], ports: [] }
    ]
    vi.mocked(api.post).mockResolvedValue({ data: mockFoundProjects })

    await store.scanDirectory('/root')

    expect(store.projects[0]).toEqual(expect.objectContaining({
      id: '2',
      name: 'New',
      managedPorts: []
    }))
  })

  it('deletes project from state and storage', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', techs: [], ports: [], managedPorts: [] }]
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.deleteProject('1')

    expect(store.projects).toEqual([])
    expect(mockDb.deleteProject).toHaveBeenCalledWith('1')
  })

  it('performs syncAll correctly', async () => {
    const store = useProjectsStore()
    const mockSyncedProjects = [
      { id: '1', name: 'Synced', path: '/path', ports: [3000], techs: [] }
    ]
    vi.mocked(api.post).mockResolvedValue({ data: mockSyncedProjects })

    await store.syncAll()

    expect(store.projects[0]).toEqual(expect.objectContaining({
      id: '1',
      name: 'Synced',
      managedPorts: []
    }))
  })
})
