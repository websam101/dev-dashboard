import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BookmarksView from './BookmarksView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { api } from '../../boot/axios'

vi.mock('../../boot/axios', () => ({
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
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          'q-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'q-space': true,
          'q-spinner-dots': true,
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-badge': true,
          'q-icon': true,
          'q-avatar': true,
          'q-tooltip': true,
          'q-dialog': { template: '<div><slot /></div>' },
          'q-input': true,
          'q-card-actions': true,
          'q-list': { template: '<div><slot /></div>' },
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div @click="$emit(\'click\')"><slot /></div>' },
          'q-item-label': true,
          'FaviconRenderer': true
        }
      }
    })
  })

  it('mounts and loads bookmarks', () => {
    const bookmarksStore = useBookmarksStore()
    expect(bookmarksStore.loadBookmarks).toHaveBeenCalled()
  })

  it('saves bookmark if valid', async () => {
    const bookmarksStore = useBookmarksStore()
    wrapper.vm.newBookmark = { title: 'T1', url: 'http://u1', category: 'C1', description: '' }
    await wrapper.vm.saveBookmark()
    expect(bookmarksStore.addBookmark).toHaveBeenCalled()
    expect(wrapper.vm.newBookmark.title).toBe('')
  })

  it('does not save bookmark if title is missing', async () => {
    const bookmarksStore = useBookmarksStore()
    wrapper.vm.newBookmark = { title: '', url: 'http://u1', category: 'C1', description: '' }
    await wrapper.vm.saveBookmark()
    expect(bookmarksStore.addBookmark).not.toHaveBeenCalled()
  })

  it('does not save bookmark if url is missing', async () => {
    const bookmarksStore = useBookmarksStore()
    wrapper.vm.newBookmark = { title: 'T1', url: '', category: 'C1', description: '' }
    await wrapper.vm.saveBookmark()
    expect(bookmarksStore.addBookmark).not.toHaveBeenCalled()
  })

  it('removes bookmark', async () => {
    const bookmarksStore = useBookmarksStore()
    await wrapper.vm.removeBookmark('1')
    expect(api.post).toHaveBeenCalledWith('/api/bookmarks/remove', { id: '1' })
    expect(bookmarksStore.loadBookmarks).toHaveBeenCalled()
  })

  it('opens link in new window', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    wrapper.vm.openLink('http://test.com')
    expect(windowSpy).toHaveBeenCalledWith('http://test.com', '_blank')
  })
})
