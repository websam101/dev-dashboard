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
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HomeView from './HomeView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useProjectsStore } from '../../stores/projectsStore'
import { useBookmarksStore } from '../../stores/bookmarksStore'
import { useSystemStore } from '../../stores/systemStore'
import { api } from '../../boot/api'

// Mock dependencies
vi.mock('../../boot/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  },
  default: {
    get: vi.fn(),
    post: vi.fn()
  },
  hasBackend: true
}))

describe('HomeView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: { status: 'ok' } })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
  })

  it('mounts and calls load actions', async () => {
    const projectsStore = useProjectsStore()
    const bookmarksStore = useBookmarksStore()
    const systemStore = useSystemStore()
    
    vi.spyOn(projectsStore, 'loadProjects').mockResolvedValue(undefined)
    vi.spyOn(bookmarksStore, 'loadBookmarks').mockResolvedValue(undefined)
    vi.spyOn(systemStore, 'fetchStats').mockResolvedValue(undefined)

    mount(HomeView, {
      global: {
        stubs: ['router-link', 'q-page', 'q-card', 'q-card-section', 'q-icon', 'q-linear-progress', 'q-tooltip', 'q-badge', 'q-btn', 'q-list', 'q-item', 'q-item-section', 'q-spinner-dots', 'q-spinner-grid']
      }
    })

    // Give it a tick for onMounted to finish its async parts
    await vi.waitFor(() => {
      expect(projectsStore.loadProjects).toHaveBeenCalled()
    })
    
    expect(bookmarksStore.loadBookmarks).toHaveBeenCalled()
    expect(systemStore.fetchStats).toHaveBeenCalled()
  })

  it('calculates totals and favorite projects', () => {
    const projectsStore = useProjectsStore()
    const bookmarksStore = useBookmarksStore()
    
    projectsStore.projects = [
      { id: '1', name: 'P1', path: 'p1', description: '', techs: [], ports: [], favorite: true },
      { id: '2', name: 'P2', path: 'p2', description: '', techs: [], ports: [], favorite: false },
      { id: '3', name: 'P3', path: 'p3', description: '', techs: [], ports: [], favorite: true },
      { id: '4', name: 'P4', path: 'p4', description: '', techs: [], ports: [], favorite: false }
    ]
    bookmarksStore.bookmarks = [{ id: 'b1', title: 'B1', url: 'u', tags: [], createdAt: '', favorite: false, projectIds: [], description: '' }]

    const wrapper = mount(HomeView, {
      global: {
        stubs: ['router-link', 'q-page', 'q-card', 'q-card-section', 'q-icon', 'q-linear-progress', 'q-tooltip', 'q-badge', 'q-btn', 'q-list', 'q-item', 'q-item-section', 'q-spinner-grid']
      }
    })

    const vm = wrapper.vm as any
    expect(vm.totalProjects).toBe(4)
    expect(vm.favoriteProjects).toHaveLength(2)
    expect(vm.totalBookmarks).toBe(1)
  })

  it('formats uptime correctly', () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: ['router-link', 'q-page', 'q-card', 'q-card-section', 'q-icon', 'q-linear-progress', 'q-tooltip', 'q-badge', 'q-btn', 'q-list', 'q-item', 'q-item-section', 'q-spinner-grid']
      }
    })

    const vm = wrapper.vm as any
    expect(vm.formatUptime(3661)).toBe('1h 1m')
    expect(vm.formatUptime(60)).toBe('0h 1m')
  })

  it('opens VS Code via store', async () => {
    const projectsStore = useProjectsStore()
    const spy = vi.spyOn(projectsStore, 'openVsCode').mockResolvedValue(undefined)
    
    const wrapper = mount(HomeView, {
      global: {
        stubs: ['router-link', 'q-page', 'q-card', 'q-card-section', 'q-icon', 'q-linear-progress', 'q-tooltip', 'q-badge', 'q-btn', 'q-list', 'q-item', 'q-item-section', 'q-spinner-grid']
      }
    })

    const vm = wrapper.vm as any
    await vm.openVsCode('/test/path')
    expect(spy).toHaveBeenCalledWith('/test/path')
  })
})
