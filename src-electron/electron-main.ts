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
import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import { SystemMonitor } from '../src/services/server/SystemMonitor';
import { ProjectManager } from '../src/services/server/ProjectManager';
import type { ProjectInfo } from '../src/services/server/ProjectManager';
import { ActionExecutor } from '../src/services/server/ActionExecutor';
import { JSONFilePreset } from 'lowdb/node';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string[];
}

interface DatabaseSchema {
  projects: ProjectInfo[];
  bookmarks: Bookmark[];
  settings: {
    darkMode: boolean;
    autoCheckPorts: boolean;
    portCheckInterval: number;
    scanRoots: string[];
    locale: string;
    showSystemStats: boolean;
  };
}

// --- Internal API Server for Electron ---
async function startInternalServer() {
  const server = express();
  server.use(bodyParser.json());

  const sys = new SystemMonitor();
  const projects = new ProjectManager();
  const exec = new ActionExecutor();

  const dbFolder = path.join(os.homedir(), '.dev-dashboard');
  try {
    const fs = await import('node:fs/promises');
    await fs.mkdir(dbFolder, { recursive: true });
  } catch (e) {
    console.error('Failed to create DB folder:', e);
  }

  const dbPath = path.join(dbFolder, 'db.json');
  const defaultData: DatabaseSchema = {
    projects: [],
    bookmarks: [],
    settings: {
      darkMode: true,
      autoCheckPorts: true,
      portCheckInterval: 30000,
      scanRoots: [],
      locale: 'en-US',
      showSystemStats: true
    }
  };
  const db = await JSONFilePreset<DatabaseSchema>(dbPath, defaultData);
  await db.read();

  // IPC for Folder Picker
  ipcMain.handle('select-folder', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('export-bookmarks', async (event, data: string) => {
    if (!mainWindow) return false;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Bookmarks',
      defaultPath: 'bookmarks-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    
    if (!result.canceled && result.filePath) {
      const fs = await import('node:fs/promises');
      await fs.writeFile(result.filePath, data, 'utf8');
      return true;
    }
    return false;
  });

  ipcMain.handle('import-bookmarks', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Bookmarks',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    });
    
    if (!result.canceled && result.filePaths[0]) {
      const fs = await import('node:fs/promises');
      const content = await fs.readFile(result.filePaths[0], 'utf8');
      return content;
    }
    return null;
  });

  server.get('/api/system/stats', (req, res) => {
    void (async () => {
      res.json(await sys.getStats());
    })();
  });

  server.get('/api/projects', (req, res) => {
    res.json(db.data.projects);
  });

  server.post('/api/projects/scan', (req, res) => {
    void (async () => {
      const { rootPath } = req.body as { rootPath: string };
      const found = await projects.scanDirectory(rootPath);
      const existingPaths = new Set(db.data.projects.map((p: ProjectInfo) => p.path));
      const newOnes = found.filter(p => !existingPaths.has(p.path));
      db.data.projects.push(...newOnes);
      await db.write();
      res.json(db.data.projects);
    })();
  });

  server.post('/api/projects/remove', (req, res) => {
    void (async () => {
      const { id } = req.body as { id: string };
      db.data.projects = db.data.projects.filter((p: ProjectInfo) => p.id !== id);
      await db.write();
      res.json({ success: true });
    })();
  });

  // Settings Endpoints
  server.get('/api/settings', (req, res) => {
    res.json(db.data.settings);
  });

  server.post('/api/settings', (req, res) => {
    void (async () => {
      db.data.settings = req.body;
      await db.write();
      res.json(db.data.settings);
    })();
  });

  server.post('/api/actions/open-code', (req, res) => {
    const { path } = req.body as { path: string };
    exec.openVsCode(path);
    res.json({ success: true });
  });

  server.post('/api/actions/open-terminal', (req, res) => {
    const { path } = req.body as { path: string };
    exec.openTerminal(path);
    res.json({ success: true });
  });

  server.post('/api/actions/open-folder', (req, res) => {
    void (async () => {
      const { path } = req.body as { path: string };
      await exec.openFolder(path);
      res.json({ success: true });
    })();
  });

  server.post('/api/actions/open-task-manager', (req, res) => {
    exec.openTaskManager();
    res.json({ success: true });
  });

  server.post('/api/utils/check-port', (req, res) => {
    void (async () => {
      try {
        const { port } = req.body as { port: number };
        if (!port) return res.status(400).json({ error: 'Port required' });
        const inUse = await sys.checkPort(port);
        res.json({ inUse });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  server.post('/api/projects/git-pull', (req, res) => {
    void (async () => {
      const { path } = req.body as { path: string };
      await projects.gitPull(path);
      res.json({ success: true });
    })();
  });

  server.post('/api/projects/git-push', (req, res) => {
    void (async () => {
      const { path } = req.body as { path: string };
      await projects.gitPush(path);
      res.json({ success: true });
    })();
  });

  server.post('/api/projects/sync-all', (req, res) => {
    void (async () => {
      db.data.projects = await projects.syncAll(db.data.projects);
      await db.write();
      res.json(db.data.projects);
    })();
  });

  server.post('/api/projects/update', (req, res) => {
    void (async () => {
      try {
        const project = req.body as ProjectInfo;
        const idx = db.data.projects.findIndex(p => p.id === project.id);
        if (idx >= 0) {
          db.data.projects[idx] = { ...db.data.projects[idx], ...project };
          await db.write();
          res.json(db.data.projects[idx]);
        } else {
          res.status(404).json({ error: 'Project not found' });
        }
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  server.get('/api/bookmarks', (req, res) => {
    res.json(db.data.bookmarks);
  });

  server.post('/api/bookmarks/remove', (req, res) => {
    void (async () => {
      const { id } = req.body as { id: string };
      db.data.bookmarks = db.data.bookmarks.filter(b => b.id !== id);
      await db.write();
      res.json({ success: true });
    })();
  });

  server.post('/api/utils/fetch-metadata', (req, res) => {
    void (async () => {
      try {
        const { url } = req.body as { url: string };
        if (!url) return res.status(400).json({ error: 'URL required' });

        const response = await fetch(url);
        const html = await response.text();

        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) || 
                          html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);

        res.json({
          title: titleMatch ? titleMatch[1] : '',
          description: descMatch ? descMatch[1] : ''
        });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  server.post('/api/bookmarks', (req, res) => {
    void (async () => {
      const bookmark = req.body as Bookmark;
      // Upsert: update if exists, otherwise push
      const idx = db.data.bookmarks.findIndex(b => b.id === bookmark.id);
      if (idx >= 0) db.data.bookmarks[idx] = bookmark;
      else db.data.bookmarks.push(bookmark);
      await db.write();
      res.json(db.data.bookmarks);
    })();
  });

  // Open external links in the default OS browser
  ipcMain.handle('open-external', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  // Listen on a local port that axios boot file can reach
  server.listen(3001, '127.0.0.1');
}

async function createWindow() {
  await startInternalServer();

  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'),
    width: 1200,
    height: 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER!, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION!)
      ),
    },
  });

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL!);
  } else {
    await mainWindow.loadFile('index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  // Remove the application menu entirely
  Menu.setApplicationMenu(null);

  // Open all target=_blank / window.open links in the default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createWindow();
  }
});
