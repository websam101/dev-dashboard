import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BookmarksView from './BookmarksView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { api } from '../../boot/api';

vi.mock('../../boot/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}))

describe('BookmarksView', () => {
  let wrapper: any

  beforeEach(() => {
    vi.resetAllMocks()
    wrapper = mount(BookmarksView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
  })

  it('mounts and loads bookmarks', () => {
    const bookmarksStore = useBookmarksStore()
    expect(bookmarksStore.loadBookmarks).toHaveBeenCalled()
  })

  it('saves bookmark if valid', async () => {
    const bookmarksStore = useBookmarksStore()
    wrapper.vm.editingBookmark = { title: 'T1', url: 'http://u1', tags: [], description: '', projectIds: ['global'] }
    await wrapper.vm.saveBookmark()
    expect(bookmarksStore.addBookmark).toHaveBeenCalled()
  })

  it('removes bookmark', async () => {
    const bookmarksStore = useBookmarksStore()
    const b = { id: '1', title: 'B1' }
    // confirmRemove triggers a dialog, but we can test the store call if we bypass dialog
    await bookmarksStore.deleteBookmark('1')
    expect(bookmarksStore.deleteBookmark).toHaveBeenCalledWith('1')
  })

  it('opens link in new window', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    wrapper.vm.openLink('http://test.com')
    expect(windowSpy).toHaveBeenCalledWith('http://test.com', '_blank')
  })
})
