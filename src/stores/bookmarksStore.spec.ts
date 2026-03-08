import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarksStore } from './bookmarksStore'
import { api } from '../boot/api'

// Hoist the mock data so it's available inside vi.mock
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getBookmarks: vi.fn(),
    getCollections: vi.fn(),
    addBookmark: vi.fn().mockResolvedValue(undefined),
    deleteBookmark: vi.fn().mockResolvedValue(undefined),
    addCollection: vi.fn().mockResolvedValue(undefined),
    updateCollection: vi.fn().mockResolvedValue(undefined),
    deleteCollection: vi.fn().mockResolvedValue(undefined)
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

describe('Bookmarks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    mockDb.getCollections.mockResolvedValue([])
    mockDb.getBookmarks.mockResolvedValue([])
  })

  it('initializes with empty bookmarks', () => {
    const store = useBookmarksStore()
    expect(store.bookmarks).toEqual([])
  })

  it('loads bookmarks and merges with defaults', async () => {
    const store = useBookmarksStore()
    const mockLocal = [{ id: '1', title: 'L', url: 'u', description: '', tags: [], projectIds: [], favorite: false, createdAt: '' }]
    mockDb.getBookmarks.mockResolvedValue(mockLocal as any)

    await store.loadBookmarks()

    expect(store.bookmarks[0]).toEqual(expect.objectContaining({
      id: '1',
      title: 'L',
      favorite: false
    }))
  })

  it('adds bookmark with correct structure', async () => {
    const store = useBookmarksStore()
    const newB = { title: 'N', url: 'u', tags: ['T'], description: '' }

    await store.addBookmark(newB as any)

    expect(store.bookmarks[0]).toEqual(expect.objectContaining({
      title: 'N',
      favorite: false
    }))
    expect(mockDb.addBookmark).toHaveBeenCalled()
  })

  it('deletes bookmark', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B', url: 'u', tags: [], createdAt: '', favorite: false, projectIds: [], description: '' }]

    await store.deleteBookmark('1')

    expect(store.bookmarks).toHaveLength(0)
    expect(mockDb.deleteBookmark).toHaveBeenCalledWith('1')
  })

  it('toggles favorite status', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B', url: 'u', tags: [], createdAt: '', favorite: false, projectIds: [], description: '' }]
    
    await store.toggleFavorite('1')
    expect(store.bookmarks[0]!.favorite).toBe(true)
    expect(mockDb.addBookmark).toHaveBeenCalled()
  })

  it('performs importSnapshot correctly (clears and replaces)', async () => {
    const store = useBookmarksStore()
    const oldBookmarks = [{ id: 'old', title: 'Old', url: 'u', tags: [], createdAt: '', favorite: false, projectIds: [], description: '' }]
    const oldCollections = [{ id: 'cold', name: 'OldCol' }]
    
    // Set initial state
    store.bookmarks = [...oldBookmarks]
    store.collections = [...oldCollections]
    
    // Mock existing data returned by DB
    mockDb.getBookmarks.mockResolvedValue(oldBookmarks as any)
    mockDb.getCollections.mockResolvedValue(oldCollections as any)

    const newSnapshot = {
      bookmarks: [{ id: 'new', title: 'New', url: 'u', tags: [], createdAt: '', description: '' }],
      collections: [{ id: 'cnew', name: 'NewCol' }]
    }

    await store.importSnapshot(newSnapshot as any)

    expect(mockDb.deleteBookmark).toHaveBeenCalledWith('old')
    expect(mockDb.deleteCollection).toHaveBeenCalledWith('cold')
    expect(mockDb.addBookmark).toHaveBeenCalledWith(expect.objectContaining({ id: 'new' }))
    expect(mockDb.addCollection).toHaveBeenCalledWith(expect.objectContaining({ id: 'cnew' }))
  })

  it('forcePushToBackend calls sync endpoints', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B', url: 'u', tags: [], createdAt: '', favorite: false, projectIds: [], description: '' }]
    store.collections = [{ id: 'c1', name: 'C1' }]

    await store.forcePushToBackend()

    expect(api.post).toHaveBeenCalledWith('/api/collections/sync', expect.any(Array))
    expect(api.post).toHaveBeenCalledWith('/api/bookmarks/sync', expect.any(Array))
  })

  it('forcePullFromBackend fetches and imports', async () => {
    const store = useBookmarksStore()
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/api/collections') return { data: [{ id: 'rc', name: 'RC' }] }
      if (url === '/api/bookmarks') return { data: [{ id: 'rb', title: 'RB', url: 'u', description: '' }] }
      return { data: [] }
    })

    const importSpy = vi.spyOn(store, 'importSnapshot')
    await store.forcePullFromBackend()

    expect(importSpy).toHaveBeenCalledWith(expect.objectContaining({
      collections: expect.arrayContaining([expect.objectContaining({ name: 'RC' })]),
      bookmarks: expect.arrayContaining([expect.objectContaining({ title: 'RB' })])
    }))
  })
})
