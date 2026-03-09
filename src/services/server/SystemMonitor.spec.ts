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
import { SystemMonitor } from './SystemMonitor'
import os from 'node:os'
import si from 'systeminformation'

const { mockHandlers } = vi.hoisted(() => ({
  mockHandlers: {
    totalmem: vi.fn(),
    freemem: vi.fn(),
    uptime: vi.fn(),
    cpus: vi.fn(),
    loadavg: vi.fn()
  }
}))

vi.mock('node:os', () => ({
  totalmem: mockHandlers.totalmem,
  freemem: mockHandlers.freemem,
  uptime: mockHandlers.uptime,
  cpus: mockHandlers.cpus,
  loadavg: mockHandlers.loadavg,
  default: {
    totalmem: mockHandlers.totalmem,
    freemem: mockHandlers.freemem,
    uptime: mockHandlers.uptime,
    cpus: mockHandlers.cpus,
    loadavg: mockHandlers.loadavg
  }
}))

vi.mock('systeminformation', () => ({
  currentLoad: vi.fn(),
  fsSize: vi.fn(),
  networkStats: vi.fn().mockResolvedValue([{ tx_bytes: 1024, rx_bytes: 2048 }]),
  networkConnections: vi.fn(),
  default: {
    currentLoad: vi.fn(),
    fsSize: vi.fn(),
    networkStats: vi.fn(),
    networkConnections: vi.fn()
  }
}))

describe('SystemMonitor', () => {
  let monitor: SystemMonitor

  beforeEach(() => {
    monitor = new SystemMonitor()
    vi.resetAllMocks()
    
    // Setup default mock values
    mockHandlers.totalmem.mockReturnValue(16 * 1024 ** 3)
    mockHandlers.freemem.mockReturnValue(8 * 1024 ** 3)
    mockHandlers.uptime.mockReturnValue(3600)
    mockHandlers.cpus.mockReturnValue([
      { model: 'Intel', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
      { model: 'Intel', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }
    ])
    mockHandlers.loadavg.mockReturnValue([0.5, 0.5, 0.5])
  })

  it('gets basic stats when systeminformation works', async () => {
    vi.mocked(si.currentLoad).mockResolvedValue({ currentLoad: 15 } as any)
    vi.mocked(si.fsSize).mockResolvedValue([{ mount: 'C:', size: 100 * 1024 ** 3, used: 40 * 1024 ** 3, use: 40 }] as any)

    const stats = await monitor.getStats()

    expect(stats.cpuLoad).toBe(15)
    expect(stats.cpuCores).toBe(2)
    expect(stats.memTotal).toBe(16)
    expect(stats.memPercent).toBe(50)
    expect(stats.diskTotal).toBe(100)
    expect(stats.diskPercent).toBe(40)
    expect(stats.platform).toBe(process.platform)
  })

  it('handles disk mount fallback (not C:)', async () => {
    vi.mocked(si.currentLoad).mockResolvedValue({ currentLoad: 10 } as any)
    vi.mocked(si.fsSize).mockResolvedValue([{ mount: '/dev/sda1', size: 50 * 1024 ** 3, used: 10 * 1024 ** 3, use: 20 }] as any)

    const stats = await monitor.getStats()
    expect(stats.diskTotal).toBe(50)
    expect(stats.diskPercent).toBe(20)
  })

  it('handles empty disk list', async () => {
    vi.mocked(si.currentLoad).mockResolvedValue({ currentLoad: 10 } as any)
    vi.mocked(si.fsSize).mockResolvedValue([] as any)

    const stats = await monitor.getStats()
    expect(stats.diskTotal).toBe(0)
  })

  it('handles systeminformation timeouts', async () => {
    // Mock currentLoad to be slow
    vi.mocked(si.currentLoad).mockReturnValue(new Promise(resolve => setTimeout(() => resolve({ currentLoad: 10 } as any), 5000)))
    vi.mocked(si.fsSize).mockResolvedValue([{ mount: 'C:', size: 100 * 1024 ** 3, used: 10 * 1024 ** 3, use: 10 }] as any)

    const stats = await monitor.getStats()

    expect(stats.cpuLoad).toBe(0) // Fell back to 0 due to timeout
    expect(stats.memTotal).toBe(16) // Native OS still works
  }, 10000)

  it('handles systeminformation total failure', async () => {
    vi.mocked(si.currentLoad).mockRejectedValue(new Error('SI Failure'))
    
    const stats = await monitor.getStats()

    expect(stats.cpuLoad).toBe(0)
    expect(stats.memTotal).toBe(16)
    expect(stats.diskTotal).toBe(0)
  })

  it('checks port status (busy)', async () => {
    vi.mocked(si.networkConnections).mockResolvedValue([{ state: 'LISTEN', localPort: '8080' }] as any)
    const inUse = await monitor.checkPort(8080)
    expect(inUse).toBe(true)
  })

  it('checks port status (free)', async () => {
    vi.mocked(si.networkConnections).mockResolvedValue([{ state: 'LISTEN', localPort: '3000' }] as any)
    const inUse = await monitor.checkPort(8080)
    expect(inUse).toBe(false)
  })
})
