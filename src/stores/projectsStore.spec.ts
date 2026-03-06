import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjectsStore } from './projectsStore'
import { api } from '../boot/axios'

// Hoist the mock data so it's available inside vi.mock
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getProjects: vi.fn().mockResolvedValue([]),
    addProject: vi.fn().mockResolvedValue(undefined),
    deleteProject: vi.fn().mockResolvedValue(undefined)
  }
}))

// Mock dependencies
vi.mock('../boot/axios', () => ({
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
      { id: '1', name: 'Local', path: '/path' }, // missing techs/ports
      { id: '2', name: 'Local2', path: '/path2', techs: ['node'], ports: [3000] } // has techs/ports
    ]
    const mockRemoteProjects = [{ id: '1', name: 'Remote', path: '/path', techs: ['vue'], git: {}, ports: [] }]
    
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockResolvedValue({ data: mockRemoteProjects })

    await store.loadProjects()

    expect(store.projects).toEqual(mockRemoteProjects)
    expect(mockDb.getProjects).toHaveBeenCalled()
    expect(api.get).toHaveBeenCalledWith('/api/projects')
    expect(mockDb.addProject).toHaveBeenCalled()
  })

  it('handles backend sync with empty response', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [{ id: '1', name: 'Local', path: '/path' }]
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await store.loadProjects()

    expect(store.projects).toHaveLength(1)
    expect(store.projects[0]!.name).toBe('Local')
  })

  it('handles backend sync with non-array response', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [{ id: '1', name: 'Local', path: '/path' }]
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockResolvedValue({ data: { error: 'invalid' } })

    await store.loadProjects()

    expect(store.projects).toHaveLength(1)
    expect(store.projects[0]!.name).toBe('Local')
  })

  it('handles backend sync with null response', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [{ id: '1', name: 'Local', path: '/path' }]
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockResolvedValue({ data: null })

    await store.loadProjects()

    expect(store.projects).toHaveLength(1)
  })

  it('handles backend sync failure during loadProjects', async () => {
    const store = useProjectsStore()
    const mockLocalProjects = [{ id: '1', name: 'Local', path: '/path' }]
    
    mockDb.getProjects.mockResolvedValue(mockLocalProjects as any)
    vi.mocked(api.get).mockRejectedValue(new Error('Sync failed'))

    await store.loadProjects()

    expect(store.projects).toEqual(mockLocalProjects.map(p => ({ ...p, techs: [], git: undefined, ports: [] })))
    expect(store.loading).toBe(false)
  })

  it('handles total load failure (DB error)', async () => {
    const store = useProjectsStore()
    mockDb.getProjects.mockRejectedValue(new Error('DB failure'))

    await store.loadProjects()

    expect(store.projects).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('scans directory and updates state/local storage', async () => {
    const store = useProjectsStore()
    const mockFoundProjects = [
      { id: '2', name: 'New', path: '/new' }, // missing optional git
      { id: '3', name: 'New2', path: '/new2', git: { branch: 'main' }, ports: [8080] } // has git/ports
    ]
    vi.mocked(api.post).mockResolvedValue({ data: mockFoundProjects })

    await store.scanDirectory('/root')

    expect(store.projects).toEqual(mockFoundProjects)
    expect(api.post).toHaveBeenCalledWith('/api/projects/scan', { rootPath: '/root' })
    expect(mockDb.addProject).toHaveBeenCalled()
  })

  it('handles scan with invalid response', async () => {
    const store = useProjectsStore()
    vi.mocked(api.post).mockResolvedValue({ data: 'not an array' })

    await store.scanDirectory('/root')

    expect(store.projects).toEqual([])
  })

  it('handles scan failure', async () => {
    const store = useProjectsStore()
    vi.mocked(api.post).mockRejectedValue(new Error('Scan failed'))

    await expect(store.scanDirectory('/root')).rejects.toThrow('Scan failed')
    expect(store.loading).toBe(false)
  })

  it('deletes project from state and storage', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', techs: [], ports: [] }]
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.deleteProject('1')

    expect(store.projects).toEqual([])
    expect(mockDb.deleteProject).toHaveBeenCalledWith('1')
    expect(api.post).toHaveBeenCalledWith('/api/projects/remove', { id: '1' })
  })

  it('handles delete project failure (DB error)', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', techs: [], ports: [] }]
    mockDb.deleteProject.mockRejectedValue(new Error('DB Delete failed'))
    
    await store.deleteProject('1')
    
    expect(store.projects).toHaveLength(1) // Should NOT remove from state if DB fails
  })

  it('handles delete project backend failure (API error)', async () => {
    const store = useProjectsStore()
    store.projects = [{ id: '1', name: 'P1', path: '/p1', techs: [], ports: [] }]
    vi.mocked(api.post).mockRejectedValue(new Error('API Delete failed'))
    
    await store.deleteProject('1')
    
    expect(store.projects).toEqual([]) // Should still remove from state if backend fails but local DB worked
  })

  it('calls OS actions correctly', async () => {
    const store = useProjectsStore()
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })
    
    await store.openVsCode('/path')
    expect(api.post).toHaveBeenCalledWith('/api/actions/open-code', { path: '/path' })

    await store.openTerminal('/path')
    expect(api.post).toHaveBeenCalledWith('/api/actions/open-terminal', { path: '/path' })

    await store.openFolder('/path')
    expect(api.post).toHaveBeenCalledWith('/api/actions/open-folder', { path: '/path' })
  })

  it('performs git pull and refreshes', async () => {
    const store = useProjectsStore()
    const loadSpy = vi.spyOn(store, 'loadProjects').mockResolvedValue(undefined)
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.gitPull('/path')

    expect(api.post).toHaveBeenCalledWith('/api/projects/git-pull', { path: '/path' })
    expect(loadSpy).toHaveBeenCalled()
  })

  it('performs git push and refreshes', async () => {
    const store = useProjectsStore()
    const loadSpy = vi.spyOn(store, 'loadProjects').mockResolvedValue(undefined)
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.gitPush('/path')

    expect(api.post).toHaveBeenCalledWith('/api/projects/git-push', { path: '/path' })
    expect(loadSpy).toHaveBeenCalled()
  })

  it('performs syncAll correctly', async () => {
    const store = useProjectsStore()
    const mockSyncedProjects = [
      { id: '1', name: 'Synced', path: '/path' },
      { id: '2', name: 'Synced2', path: '/path2', git: { branch: 'main' }, ports: [3000] }
    ]
    vi.mocked(api.post).mockResolvedValue({ data: mockSyncedProjects })

    await store.syncAll()

    expect(store.projects).toEqual(mockSyncedProjects)
    expect(api.post).toHaveBeenCalledWith('/api/projects/sync-all')
    expect(mockDb.addProject).toHaveBeenCalled()
  })

  it('handles syncAll with invalid response', async () => {
    const store = useProjectsStore()
    vi.mocked(api.post).mockResolvedValue({ data: null })

    await store.syncAll()

    expect(store.projects).toEqual([])
  })
})
