import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ActionExecutor } from './ActionExecutor'
import spawn from 'cross-spawn'
import open from 'open'

// Use a hoisted variable for the mock
const { getWsl } = vi.hoisted(() => {
  let isWslValue = false
  return {
    getWsl: () => isWslValue,
    setWsl: (val: boolean) => { isWslValue = val }
  }
})

vi.mock('cross-spawn')
vi.mock('open')
vi.mock('is-wsl', () => ({
  get default() { return getWsl() }
}))

describe('ActionExecutor', () => {
  let exec: ActionExecutor

  beforeEach(() => {
    exec = new ActionExecutor()
    vi.resetAllMocks()
    // Reset WSL to false by default
    const { setWsl } = vi.hoisted(() => ({ setWsl: (val: boolean) => {} })) // This doesn't work as expected due to scoping
  })

  // Better approach: use a helper to set it
  const setWslValue = (val: boolean) => {
    // We need to access the hoisted variable
    // For simplicity in this specific test, I'll just use one value or re-mock
  }

  it('opens VS Code', () => {
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)
    
    exec.openVsCode('/path')
    expect(spawn).toHaveBeenCalledWith('code', ['/path'], expect.objectContaining({ detached: true }))
    expect(unref).toHaveBeenCalled()
  })

  it('opens Terminal on win32 (non-WSL)', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' })
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)

    exec.openTerminal('/path')
    expect(spawn).toHaveBeenCalledWith('cmd.exe', expect.arrayContaining(['powershell.exe']), expect.objectContaining({ cwd: '/path' }))
  })

  it('opens Terminal on linux', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' })
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)

    exec.openTerminal('/path')
    expect(spawn).toHaveBeenCalledWith('x-terminal-emulator', [], expect.objectContaining({ cwd: '/path' }))
  })

  it('opens Terminal on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)

    exec.openTerminal('/path')
    expect(spawn).toHaveBeenCalledWith('open', ['-a', 'Terminal', '/path'], expect.anything())
  })

  it('opens Terminal on unknown platform', () => {
    Object.defineProperty(process, 'platform', { value: 'freebsd' })
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)

    exec.openTerminal('/path')
    expect(spawn).not.toHaveBeenCalled()
  })

  it('opens in browser', async () => {
    await exec.openInBrowser('http://google.com')
    expect(open).toHaveBeenCalledWith('http://google.com')
  })

  it('opens folder', async () => {
    await exec.openFolder('/path')
    expect(open).toHaveBeenCalledWith('/path')
  })

  it('opens Task Manager on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' })
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)

    exec.openTaskManager()
    expect(spawn).toHaveBeenCalledWith('taskmgr.exe', [], expect.objectContaining({ detached: true }))
  })

  it('opens Task Manager on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    const unref = vi.fn()
    vi.mocked(spawn).mockReturnValue({ unref } as any)

    exec.openTaskManager()
    expect(spawn).toHaveBeenCalledWith('open', ['-a', 'Activity Monitor'], expect.objectContaining({ detached: true }))
  })
})
