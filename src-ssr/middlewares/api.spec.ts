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
import { describe, it, expect, vi, beforeEach } from 'vitest'
import middleware from './api'
import { SystemMonitor } from '../../src/services/server/SystemMonitor'
import { ProjectManager } from '../../src/services/server/ProjectManager'
import { ActionExecutor } from '../../src/services/server/ActionExecutor'
import { JSONFilePreset } from 'lowdb/node'
import fs from 'node:fs/promises'

vi.mock('lowdb/node')
vi.mock('../../src/services/server/SystemMonitor')
vi.mock('../../src/services/server/ProjectManager')
vi.mock('../../src/services/server/ActionExecutor')
vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined)
  },
  mkdir: vi.fn().mockResolvedValue(undefined)
}))

describe('API Middleware', () => {
  let app: any
  let db: any
  const routes: Record<string, Function> = {}

  beforeEach(async () => {
    vi.resetAllMocks()
    app = {
      use: vi.fn(),
      get: vi.fn((path, handler) => { routes[`GET:${path}`] = handler }),
      post: vi.fn((path, handler) => { routes[`POST:${path}`] = handler })
    }
    db = {
      data: { projects: [], bookmarks: [], settings: { scanRoots: [] } },
      read: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(undefined)
    }
    vi.mocked(JSONFilePreset).mockResolvedValue(db)
    vi.mocked(fs.mkdir).mockResolvedValue(undefined as any)
  })

  it('handles mkdir failure', async () => {
    vi.mocked(fs.mkdir).mockRejectedValue(new Error('MKDIR fail') as any)
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
  })

  it('handles get stats success', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['GET:/api/system/stats']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const mockStats = { cpuLoad: 10 }
    vi.spyOn(SystemMonitor.prototype, 'getStats').mockResolvedValue(mockStats as any)

    handler!({}, res)
    await vi.waitFor(() => expect(res.json).toHaveBeenCalledWith(mockStats))
  })

  it('handles get stats failure', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['GET:/api/system/stats']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    vi.spyOn(SystemMonitor.prototype, 'getStats').mockRejectedValue(new Error('Stats error'))

    handler!({}, res)
    await vi.waitFor(() => expect(res.status).toHaveBeenCalledWith(500))
  })

  it('handles check-port', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/utils/check-port']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    vi.spyOn(SystemMonitor.prototype, 'checkPort').mockResolvedValue(true)

    handler!({ body: { port: 8080 } }, res)
    await vi.waitFor(() => expect(res.json).toHaveBeenCalledWith({ inUse: true }))
  })

  it('handles open-task-manager', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/actions/open-task-manager']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const spy = vi.spyOn(ActionExecutor.prototype, 'openTaskManager')

    handler!({}, res)
    expect(spy).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('handles get projects', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['GET:/api/projects']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    db.data.projects = [{ name: 'P1' }]

    handler!({}, res)
    expect(res.json).toHaveBeenCalledWith([{ name: 'P1' }])
  })

  it('handles projects scan', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/scan']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { rootPath: '/root' } }
    vi.spyOn(ProjectManager.prototype, 'scanDirectory').mockResolvedValue([{ name: 'New', path: '/root/new' }] as any)

    handler!(req, res)
    await vi.waitFor(() => {
      expect(db.write).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalled()
    })
  })

  it('handles projects scan missing path', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/scan']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: {} }

    handler!(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('handles sync-all', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/sync-all']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    vi.spyOn(ProjectManager.prototype, 'syncAll').mockResolvedValue([{ name: 'Synced' }] as any)

    handler!({ body: {} }, res)
    await vi.waitFor(() => {
      expect(db.write).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith([{ name: 'Synced' }])
    })
  })

  it('handles sync-all failure', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/sync-all']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    vi.spyOn(ProjectManager.prototype, 'syncAll').mockRejectedValue(new Error('Sync error'))

    handler!({ body: {} }, res)
    await vi.waitFor(() => expect(res.status).toHaveBeenCalledWith(500))
  })

  it('handles project remove', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/remove']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { id: '1' } }
    db.data.projects = [{ id: '1', name: 'P1' }, { id: '2', name: 'P2' }]

    handler!(req, res)
    await vi.waitFor(() => {
      expect(db.data.projects).toHaveLength(1)
      expect(db.write).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })

  it('handles actions open-code', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/actions/open-code']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { path: '/path' } }
    const spy = vi.spyOn(ActionExecutor.prototype, 'openVsCode')

    handler!(req, res)
    expect(spy).toHaveBeenCalledWith('/path')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('handles actions open-terminal', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/actions/open-terminal']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { path: '/path' } }
    const spy = vi.spyOn(ActionExecutor.prototype, 'openTerminal')

    handler!(req, res)
    expect(spy).toHaveBeenCalledWith('/path')
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('handles actions open-folder', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/actions/open-folder']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { path: '/path' } }
    const spy = vi.spyOn(ActionExecutor.prototype, 'openFolder').mockResolvedValue(undefined)

    handler!(req, res)
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith('/path')
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })

  it('handles git-pull', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/git-pull']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { path: '/path' } }
    vi.spyOn(ProjectManager.prototype, 'gitPull').mockResolvedValue(undefined)

    handler!(req, res)
    await vi.waitFor(() => {
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })

  it('handles git-pull failure', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/projects/git-pull']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    vi.spyOn(ProjectManager.prototype, 'gitPull').mockRejectedValue(new Error('Pull error'))

    handler!({ body: { path: '/path' } }, res)
    await vi.waitFor(() => expect(res.status).toHaveBeenCalledWith(500))
  })

  it('handles get bookmarks', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['GET:/api/bookmarks']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    db.data.bookmarks = [{ title: 'B1' }]

    handler!({}, res)
    expect(res.json).toHaveBeenCalledWith([{ title: 'B1' }])
  })

  it('handles add/update bookmark', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/bookmarks']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { id: '1', title: 'New' } }
    
    handler!(req, res)
    await vi.waitFor(() => {
      expect(db.data.bookmarks).toHaveLength(1)
      expect(db.write).toHaveBeenCalled()
    })

    // Update existing
    const req2 = { body: { id: '1', title: 'Updated' } }
    handler!(req2, res)
    await vi.waitFor(() => {
      expect(db.data.bookmarks).toHaveLength(1)
      expect(db.data.bookmarks[0].title).toBe('Updated')
    })
  })

  it('handles add bookmark failure', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/bookmarks']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    db.write.mockRejectedValue(new Error('Write error'))

    handler!({ body: { id: '1' } }, res)
    await vi.waitFor(() => expect(res.status).toHaveBeenCalledWith(500))
  })

  it('handles bookmark remove', async () => {
    await middleware({ app, resolve: { urlPath: (p: string) => p } } as any)
    const handler = routes['POST:/api/bookmarks/remove']
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() }
    const req = { body: { id: '1' } }
    db.data.bookmarks = [{ id: '1', title: 'B1' }]

    handler!(req, res)
    await vi.waitFor(() => {
      expect(db.data.bookmarks).toHaveLength(0)
      expect(db.write).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })
})
