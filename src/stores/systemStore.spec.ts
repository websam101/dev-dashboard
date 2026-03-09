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
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSystemStore } from './systemStore'
import { useSettingsStore } from './settingsStore'
import { useProjectsStore } from './projectsStore'
import { api } from '../boot/api';

vi.mock('../boot/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  },
  hasBackend: true
}))

vi.mock('./settingsStore', () => ({
  useSettingsStore: vi.fn().mockImplementation(() => ({
    settings: {
      showSystemStats: true
    }
  }))
}))

vi.mock('./projectsStore', () => ({
  useProjectsStore: vi.fn().mockImplementation(() => ({
    projects: []
  }))
}))

describe('System Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    vi.mocked(useSettingsStore).mockReturnValue({
      settings: { showSystemStats: true }
    } as any)
    vi.mocked(useProjectsStore).mockReturnValue({
      projects: []
    } as any)
  })

  it('initializes with null stats', () => {
    const store = useSystemStore()
    expect(store.stats).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('fetches stats successfully', async () => {
    const store = useSystemStore()
    const mockStats = { cpuLoad: 10, memPercent: 50 }
    vi.mocked(api.get).mockResolvedValue({ data: mockStats })

    await store.fetchStats()

    expect(store.stats).toEqual(mockStats)
    expect(api.get).toHaveBeenCalledWith('/api/system/stats')
  })

  it('does NOT fetch stats if showSystemStats is false', async () => {
    const store = useSystemStore()
    vi.mocked(useSettingsStore).mockImplementation(() => ({
      settings: { showSystemStats: false }
    } as any))

    await store.fetchStats()

    expect(api.get).not.toHaveBeenCalled()
  })

  it('checks port status', async () => {
    const store = useSystemStore()
    vi.mocked(api.post).mockResolvedValue({ data: { inUse: true } })

    const inUse = await store.checkPort(8080)

    expect(inUse).toBe(true)
    expect(api.post).toHaveBeenCalledWith('/api/utils/check-port', { port: 8080 })
  })

  it('opens task manager', async () => {
    const store = useSystemStore()
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } })

    await store.openTaskManager()

    expect(api.post).toHaveBeenCalledWith('/api/actions/open-task-manager')
  })

  it('detects port ownership by project (physical port)', () => {
    const store = useSystemStore()
    vi.mocked(useProjectsStore).mockReturnValue({
      projects: [{ name: 'Project A', ports: [8080], managedPorts: [] }]
    } as any)

    const owner = store.checkPortOwnership(8080)
    expect(owner).toBe('Project A')
  })

  it('detects port ownership by project (managed port)', () => {
    const store = useSystemStore()
    vi.mocked(useProjectsStore).mockReturnValue({
      projects: [{ name: 'Project B', ports: [], managedPorts: [3000] }]
    } as any)

    const owner = store.checkPortOwnership(3000)
    expect(owner).toBe('Project B')
  })

  it('returns null if port is not owned', () => {
    const store = useSystemStore()
    vi.mocked(useProjectsStore).mockReturnValue({
      projects: [{ name: 'Project A', ports: [8080], managedPorts: [] }]
    } as any)

    const owner = store.checkPortOwnership(9000)
    expect(owner).toBeNull()
  })
})
