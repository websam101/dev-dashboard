import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SystemMonitor } from './SystemMonitor'
import os from 'node:os'
import si from 'systeminformation'

vi.mock('node:os', () => ({
  default: {
    freemem: vi.fn(),
    totalmem: vi.fn(),
    uptime: vi.fn(),
    cpus: vi.fn().mockReturnValue([
      { model: 'Intel', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
      { model: 'Intel', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }
    ]),
    loadavg: vi.fn().mockReturnValue([0.5, 0.5, 0.5])
  }
}))

vi.mock('systeminformation', () => ({
  default: {
    currentLoad: vi.fn(),
    fsSize: vi.fn(),
    networkStats: vi.fn().mockResolvedValue([{ tx_bytes: 1024, rx_bytes: 2048 }])
  }
}))

describe('SystemMonitor', () => {
  let monitor: SystemMonitor

  beforeEach(() => {
    monitor = new SystemMonitor()
    vi.resetAllMocks()
    // Default OS mocks
    vi.mocked(os.totalmem).mockReturnValue(16 * 1024 ** 3)
    vi.mocked(os.freemem).mockReturnValue(8 * 1024 ** 3)
    vi.mocked(os.uptime).mockReturnValue(3600)
    vi.mocked(os.cpus).mockReturnValue([
      { model: 'Intel', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
      { model: 'Intel', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }
    ])
    vi.mocked(os.loadavg).mockReturnValue([0.5, 0.5, 0.5])
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
})
