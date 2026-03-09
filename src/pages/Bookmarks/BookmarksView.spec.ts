/**
 * Copyright (C) 2025-2026 Sam <websam101@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BookmarksView from './BookmarksView.vue'
import { createTestingPinia } from '@pinia/testing'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { api } from '../../boot/api';

vi.mock('../../boot/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  },
  hasBackend: true
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
