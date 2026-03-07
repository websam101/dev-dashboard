import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBookmarksStore } from './bookmarksStore'
import { api } from '../boot/api'

// Hoist the mock data so it's available inside vi.mock
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    getBookmarks: vi.fn().mockResolvedValue([]),
    getCollections: vi.fn().mockResolvedValue([]),
    addBookmark: vi.fn().mockResolvedValue(undefined),
    deleteBookmark: vi.fn().mockResolvedValue(undefined),
    addCollection: vi.fn().mockResolvedValue(undefined)
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

describe('Bookmarks Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('initializes with empty bookmarks', () => {
    const store = useBookmarksStore()
    expect(store.bookmarks).toEqual([])
  })

  it('loads bookmarks and merges with defaults', async () => {
    const store = useBookmarksStore()
    const mockLocal = [{ id: '1', title: 'L', url: 'u' }]
    mockDb.getBookmarks.mockResolvedValue(mockLocal as any)
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await store.loadBookmarks()

    expect(store.bookmarks[0]).toEqual(expect.objectContaining({
      id: '1',
      title: 'L',
      favorite: false
    }))
  })

  it('adds bookmark with correct structure', async () => {
    const store = useBookmarksStore()
    const newB = { title: 'N', url: 'u', tags: ['T'] }
    vi.mocked(api.post).mockResolvedValue({ data: {} })

    await store.addBookmark(newB)

    expect(store.bookmarks[0]).toEqual(expect.objectContaining({
      title: 'N',
      favorite: false
    }))
    expect(mockDb.addBookmark).toHaveBeenCalled()
  })

  it('deletes bookmark', async () => {
    const store = useBookmarksStore()
    store.bookmarks = [{ id: '1', title: 'B', url: 'u', tags: [], createdAt: '', favorite: false, projectIds: [] }]
    vi.mocked(api.post).mockResolvedValue({ data: {} })

    await store.deleteBookmark('1')

    expect(store.bookmarks).toHaveLength(0)
    expect(mockDb.deleteBookmark).toHaveBeenCalledWith('1')
  })
})
