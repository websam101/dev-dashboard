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

  openTaskManager(): void {
    const platform = process.platform;
    if (platform === 'win32') {
      spawn('taskmgr.exe', [], { stdio: 'ignore', detached: true }).unref();
    } else if (platform === 'darwin') {
      spawn('open', ['-a', 'Activity Monitor'], { stdio: 'ignore', detached: true }).unref();
    } else if (platform === 'linux') {
      // Try common ones
      spawn('gnome-system-monitor', [], { stdio: 'ignore', detached: true }).unref();
    }
  }
}
