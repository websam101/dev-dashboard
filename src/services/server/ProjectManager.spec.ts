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
import { ProjectManager } from './ProjectManager'
import fs from 'node:fs/promises'
import { simpleGit } from 'simple-git'
import si from 'systeminformation'

vi.mock('node:fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn()
  },
  readdir: vi.fn(),
  readFile: vi.fn()
}))

vi.mock('simple-git')
vi.mock('systeminformation')

describe('ProjectManager', () => {
  let manager: ProjectManager

  beforeEach(() => {
    manager = new ProjectManager()
    vi.resetAllMocks()
  })

  it('detects techs correctly (Node.js stack)', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['package.json'] as any)
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
      dependencies: { vue: '^3.0.0', quasar: '^2.0.0' },
      devDependencies: { typescript: '^5.0.0', react: '^18.0.0' }
    }))

    const techs = await manager.detectTechs('/path')
    expect(techs).toContain('nodejs')
    expect(techs).toContain('vue')
    expect(techs).toContain('typescript')
    expect(techs).toContain('react')
    expect(techs).toContain('quasar')
  })

  it('detects Python techs (requirements.txt and pyproject.toml)', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['requirements.txt'] as any)
    let techs = await manager.detectTechs('/p1')
    expect(techs).toContain('python')

    vi.mocked(fs.readdir).mockResolvedValue(['pyproject.toml'] as any)
    techs = await manager.detectTechs('/p2')
    expect(techs).toContain('python')
  })

  it('detects Go, Rust, PHP, Docker', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['go.mod'] as any)
    expect(await manager.detectTechs('/go')).toContain('go')

    vi.mocked(fs.readdir).mockResolvedValue(['Cargo.toml'] as any)
    expect(await manager.detectTechs('/rust')).toContain('rust')

    vi.mocked(fs.readdir).mockResolvedValue(['composer.json'] as any)
    expect(await manager.detectTechs('/php')).toContain('php')

    vi.mocked(fs.readdir).mockResolvedValue(['docker-compose.yml'] as any)
    expect(await manager.detectTechs('/d1')).toContain('docker')

    vi.mocked(fs.readdir).mockResolvedValue(['Dockerfile'] as any)
    expect(await manager.detectTechs('/d2')).toContain('docker')
  })

  it('handles readdir failure in detectTechs', async () => {
    vi.mocked(fs.readdir).mockRejectedValue(new Error('Read failed'))
    const techs = await manager.detectTechs('/path')
    expect(techs).toEqual([])
  })

  it('gets git info correctly', async () => {
    const mockGit = {
      checkIsRepo: vi.fn().mockResolvedValue(true),
      status: vi.fn().mockResolvedValue({ isClean: () => false, ahead: 1, behind: 2 }),
      revparse: vi.fn().mockResolvedValue('main'),
      remote: vi.fn().mockResolvedValue('https://github.com/repo\n'),
      log: vi.fn().mockResolvedValue({ latest: { date: '2023-01-01' } })
    }
    vi.mocked(simpleGit).mockReturnValue(mockGit as any)

    const gitInfo = await manager.getGitInfo('/path')
    expect(gitInfo?.branch).toBe('main')
    expect(gitInfo?.url).toBe('https://github.com/repo')
  })

  it('handles non-git directory', async () => {
    const mockGit = {
      checkIsRepo: vi.fn().mockResolvedValue(false)
    }
    vi.mocked(simpleGit).mockReturnValue(mockGit as any)

    const gitInfo = await manager.getGitInfo('/path')
    expect(gitInfo).toBeUndefined()
  })

  it('handles git failure exception', async () => {
    vi.mocked(simpleGit).mockImplementation(() => {
      throw new Error('Git not installed')
    })
    const gitInfo = await manager.getGitInfo('/path')
    expect(gitInfo).toBeUndefined()
  })

  it('gets active ports correctly', async () => {
    vi.mocked(si.networkConnections).mockResolvedValue([
      { state: 'LISTEN', localPort: '3000', pid: 123 },
      { state: 'LISTEN', localPort: '8080' }
    ] as any)

    const ports = await manager.getActivePorts()
    expect(ports.size).toBe(2)
    expect(ports.get(3000)).toBe(123)
  })

  it('handles networkConnections failure', async () => {
    vi.mocked(si.networkConnections).mockRejectedValue(new Error('SI error'))
    const ports = await manager.getActivePorts()
    expect(ports.size).toBe(0)
  })

  it('scans directory and finds projects', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'p1', isDirectory: () => true },
      { name: 'p2', isDirectory: () => true },
      { name: 'empty', isDirectory: () => true }
    ] as any)
    
    vi.spyOn(manager, 'getGitInfo')
      .mockResolvedValueOnce({ branch: 'main' } as any)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(undefined)
    
    vi.spyOn(manager, 'detectTechs')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['nodejs'])
      .mockResolvedValue([])

    vi.mocked(si.networkConnections).mockResolvedValue([])

    const projects = await manager.scanDirectory('/root')
    expect(projects).toHaveLength(2) // p1 (git) and p2 (nodejs), but not empty
  })

  it('handles scanDirectory failure', async () => {
    vi.mocked(fs.readdir).mockRejectedValue(new Error('Scan error'))
    const projects = await manager.scanDirectory('/root')
    expect(projects).toEqual([])
  })

  it('performs git pull/push', async () => {
    const mockGit = {
      pull: vi.fn().mockResolvedValue({}),
      push: vi.fn().mockResolvedValue({})
    }
    vi.mocked(simpleGit).mockReturnValue(mockGit as any)

    await manager.gitPull('/path')
    expect(mockGit.pull).toHaveBeenCalled()

    await manager.gitPush('/path')
    expect(mockGit.push).toHaveBeenCalled()
  })

  it('performs syncAll correctly', async () => {
    const mockProjects = [
      { id: '1', name: 'P1', path: '/path1', techs: [], ports: [] }
    ]
    vi.spyOn(manager, 'getGitInfo').mockResolvedValue({ branch: 'sync' } as any)
    vi.spyOn(manager, 'detectTechs').mockResolvedValue(['vue'])

    const updated = await manager.syncAll(mockProjects as any)
    expect(updated[0]!.git?.branch).toBe('sync')
    expect(updated[0]!.techs).toContain('vue')
  })
})
