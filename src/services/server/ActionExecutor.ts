import spawn from 'cross-spawn';
import open from 'open';
import isWsl from 'is-wsl';

export class ActionExecutor {
  openVsCode(path: string): void {
    // On WSL, we might need to use 'code-insiders' or handle path mapping, 
    // but usually 'code' works if it's in the PATH.
    spawn('code', [path], { stdio: 'ignore', detached: true }).unref();
  }

  openTerminal(path: string): void {
    const platform = process.platform;
    
    if (platform === 'win32') {
      if (isWsl) {
        spawn('wt.exe', ['-d', path], { stdio: 'ignore', detached: true }).unref();
      } else {
        spawn('cmd.exe', ['/c', 'start', 'powershell.exe'], { cwd: path, stdio: 'ignore', detached: true }).unref();
      }
    } else if (platform === 'linux') {
      spawn('x-terminal-emulator', [], { cwd: path, stdio: 'ignore', detached: true }).unref();
    } else if (platform === 'darwin') {
      spawn('open', ['-a', 'Terminal', path], { stdio: 'ignore', detached: true }).unref();
    }
  }

  async openInBrowser(url: string): Promise<void> {
    await open(url);
  }

  async openFolder(path: string): Promise<void> {
    await open(path);
  }
}
