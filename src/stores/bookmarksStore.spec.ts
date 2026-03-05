import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarksStore } from './bookmarksStore'
import { api } from '../boot/axios'

// Hoist the mock data so it's available inside vi.mock
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getBookmarks: vi.fn().mockResolvedValue([]),
    addBookmark: vi.fn().mockResolvedValue(undefined),
    deleteBookmark: vi.fn().mockResolvedValue(undefined)
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

describe('Bookmarks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('initializes with empty bookmarks', () => {
    const store = useBookmarksStore()
    expect(store.bookmarks).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('loads bookmarks from local and syncs with backend', async () => {
    const store = useBookmarksStore()
    const mockLocalBookmarks = [
      { id: '1', title: 'Local', url: 'http://local' }, // missing category
      { id: '2', title: 'Local2', url: 'http://local2', category: 'Dev' } // has category
    ]
    const mockRemoteBookmarks = [
      { id: '1', title: 'Remote', url: 'http://remote', category: 'Dev', description: 'Desc', tags: ['tag'] }
    ]
    
    mockDb.getBookmarks.mockResolvedValue(mockLocalBookmarks as any)
    vi.mocked(api.get).mockResolvedValue({ data: mockRemoteBookmarks })

    await store.loadBookmarks()

    expect(store.bookmarks).toEqual(mockRemoteBookmarks)
    expect(mockDb.getBookmarks).toHaveBeenCalled()
    expect(api.get).toHaveBeenCalledWith('/api/bookmarks')
    expect(mockDb.addBookmark).toHaveBeenCalled()
  })

  it('handles local bookmarks with missing properties', async () => {
    const store = useBookmarksStore()
    const mockLocalBookmarks = [
      { id: '1', title: 'L1', url: 'u1' } // missing description, tags, category
    ]
    mockDb.getBookmarks.mockResolvedValue(mockLocalBookmarks as any)
    vi.mocked(api.get).mockRejectedValue(new Error('Sync failed'))

    await store.loadBookmarks()

    expect(store.bookmarks[0].category).toBe('General')
  })

  it('handles backend sync with empty response', async () => {
    const store = useBookmarksStore()
    const mockLocalBookmarks = [{ id: '1', title: 'Local', url: 'http://local', category: 'Dev' }]
    mockDb.getBookmarks.mockResolvedValue(mockLocalBookmarks as any)
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await store.loadBookmarks()

    expect(store.bookmarks).toHaveLength(1)
    expect(store.bookmarks[0].title).toBe('Local')
  })

  it('handles backend sync with non-array response', async () => {
    const store = useBookmarksStore()
    const mockLocalBookmarks = [{ id: '1', title: 'Local', url: 'http://local', category: 'Dev' }]
    mockDb.getBookmarks.mockResolvedValue(mockLocalBookmarks as any)
    vi.mocked(api.get).mockResolvedValue({ data: null })

    await store.loadBookmarks()

    expect(store.bookmarks).toHaveLength(1)
  })

  it('handles backend sync failure during loadBookmarks', async () => {
    const store = useBookmarksStore()
    const mockLocalBookmarks = [{ id: '1', title: 'Local', url: 'http://local', category: 'Dev' }]
    
    mockDb.getBookmarks.mockResolvedValue(mockLocalBookmarks as any)
    vi.mocked(api.get).mockRejectedValue(new Error('Sync failed'))

    await store.loadBookmarks()

    expect(store.bookmarks).toEqual(mockLocalBookmarks)
    expect(store.loading).toBe(false)
  })

  it('handles total load failure (DB error)', async () => {
    const store = useBookmarksStore()
    mockDb.getBookmarks.mockRejectedValue(new Error('DB failure'))

    await store.loadBookmarks()

    expect(store.bookmarks).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('adds bookmark to state and storage', async () => {
    const store = useBookmarksStore()
    const newBookmark = { title: 'New', url: 'http://new', category: 'Dev' }
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.addBookmark(newBookmark)

    expect(store.bookmarks).toHaveLength(1)
    expect(store.bookmarks[0].title).toBe('New')
    expect(mockDb.addBookmark).toHaveBeenCalled()
    expect(api.post).toHaveBeenCalledWith('/api/bookmarks', expect.objectContaining(newBookmark))
  })

  it('adds bookmark with missing optional fields', async () => {
    const store = useBookmarksStore()
    const newBookmark = { title: 'New', url: 'http://new', category: 'Dev' }
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.addBookmark(newBookmark)
    
    // Internal checks for default values during storage
    expect(mockDb.addBookmark).toHaveBeenCalledWith(expect.objectContaining({
      description: '',
      tags: []
    }))
  })

  it('handles add bookmark failure (DB error)', async () => {
    const store = useBookmarksStore()
    const newBookmark = { title: 'New', url: 'http://new', category: 'Dev' }
    mockDb.addBookmark.mockRejectedValue(new Error('DB failure'))

    await store.addBookmark(newBookmark)

    expect(store.bookmarks).toEqual([]) // Should NOT add to state if DB fails
  })

  it('handles add bookmark backend failure (API error)', async () => {
    const store = useBookmarksStore()
    const newBookmark = { title: 'New', url: 'http://new', category: 'Dev' }
    vi.mocked(api.post).mockRejectedValue(new Error('API failure'))

    await store.addBookmark(newBookmark)

    expect(store.bookmarks).toHaveLength(1) // Should still be in state if DB worked
  })

  it('deletes bookmark from state and storage', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B1', url: 'http://b1', category: 'Dev' }]
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.deleteBookmark('1')

    expect(store.bookmarks).toEqual([])
    expect(mockDb.deleteBookmark).toHaveBeenCalledWith('1')
    expect(api.post).toHaveBeenCalledWith('/api/bookmarks/remove', { id: '1' })
  })

  it('handles delete bookmark failure (DB error)', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B1', url: 'http://b1', category: 'Dev' }]
    mockDb.deleteBookmark.mockRejectedValue(new Error('DB failure'))

    await store.deleteBookmark('1')

    expect(store.bookmarks).toHaveLength(1)
  })

  it('handles delete bookmark backend failure (API error)', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B1', url: 'http://b1', category: 'Dev' }]
    vi.mocked(api.post).mockRejectedValue(new Error('API failure'))

    await store.deleteBookmark('1')

    expect(store.bookmarks).toEqual([]) // Should still remove from state if DB worked
  })

  it('calculates unique categories correctly', () => {
    const store = useBookmarksStore()
    store.bookmarks = [
      { id: '1', title: 'B1', url: 'u1', category: 'Dev' },
      { id: '2', title: 'B2', url: 'u2', category: 'Dev' },
      { id: '3', title: 'B3', url: 'u3', category: 'Tools' }
    ]
    expect(store.categories).toEqual(['Dev', 'Tools'])
  })

  it('returns empty categories if bookmarks is not an array', () => {
    const store = useBookmarksStore()
    // @ts-ignore
    store.bookmarks = null
    expect(store.categories).toEqual([])
  })

  it('filters by category correctly', () => {
    const store = useBookmarksStore()
    store.bookmarks = [
      { id: '1', title: 'B1', url: 'u1', category: 'Dev' },
      { id: '2', title: 'B2', url: 'u2', category: 'Tools' }
    ]
    expect(store.byCategory('Dev')).toHaveLength(1)
    expect(store.byCategory('Dev')[0].title).toBe('B1')
    expect(store.byCategory('Other')).toHaveLength(0)
  })

  it('returns empty array for byCategory if bookmarks is not an array', () => {
    const store = useBookmarksStore()
    // @ts-ignore
    store.bookmarks = null
    expect(store.byCategory('Dev')).toEqual([])
  })
})
