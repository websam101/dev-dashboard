import { defineSsrMiddleware } from '#q-app/wrappers';
import { SystemMonitor } from '../../src/services/server/SystemMonitor';
import { ProjectManager } from '../../src/services/server/ProjectManager';
import type { ProjectInfo } from '../../src/services/server/ProjectManager';
import { ActionExecutor } from '../../src/services/server/ActionExecutor';
import { JSONFilePreset } from 'lowdb/node';
import path from 'node:path';
import os from 'node:os';
import bodyParser from 'body-parser';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string[];
}

interface Settings {
  darkMode: boolean;
  autoCheckPorts: boolean;
  portCheckInterval: number;
  scanRoots: string[];
}

interface DatabaseSchema {
  projects: ProjectInfo[];
  bookmarks: Bookmark[];
  settings: Settings;
}

export default defineSsrMiddleware(async ({ app, resolve }) => {
  // CRITICAL: SSR Middlewares need body-parser to read POST data
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const sys = new SystemMonitor();
  const projects = new ProjectManager();
  const exec = new ActionExecutor();

  // Persistence Setup (Backend Fallback)
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
      scanRoots: [] 
    } 
  };
  const db = await JSONFilePreset<DatabaseSchema>(dbPath, defaultData);
  await db.read();

  // --- API Routes with explicit leading slashes for reliability ---

  // System Stats
  app.get('/api/system/stats', (req, res) => {
    void (async () => {
      try {
        const stats = await sys.getStats();
        res.json(stats);
      } catch (e) {
        console.error('SYSTEM STATS ERROR:', e);
        res.status(500).json({ error: 'Failed to fetch stats' });
      }
    })();
  });

  // Projects
  app.get('/api/projects', (req, res) => {
    res.json(db.data.projects);
  });

  app.post('/api/projects/scan', (req, res) => {
    void (async () => {
      try {
        const { rootPath } = req.body as { rootPath: string };
        if (!rootPath) return res.status(400).json({ error: 'rootPath required' });
        
        const found = await projects.scanDirectory(rootPath);
        const existingPaths = new Set(db.data.projects.map(p => p.path));
        const newOnes = found.filter(p => !existingPaths.has(p.path));
        
        db.data.projects.push(...newOnes);
        await db.write();
        res.json(db.data.projects);
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  app.post('/api/projects/sync-all', (req, res) => {
    void (async () => {
      try {
        db.data.projects = await projects.syncAll(db.data.projects);
        await db.write();
        res.json(db.data.projects);
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  app.post('/api/projects/remove', (req, res) => {
    void (async () => {
      const { id } = req.body as { id: string };
      db.data.projects = db.data.projects.filter(p => p.id !== id);
      await db.write();
      res.json({ success: true });
    })();
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.data.settings);
  });

  app.post('/api/settings', (req, res) => {
    void (async () => {
      try {
        db.data.settings = { ...db.data.settings, ...req.body };
        await db.write();
        res.json(db.data.settings);
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  // Actions
  app.post('/api/actions/open-code', (req, res) => {
    const { path } = req.body as { path: string };
    exec.openVsCode(path);
    res.json({ success: true });
  });

  app.post('/api/actions/open-terminal', (req, res) => {
    const { path } = req.body as { path: string };
    exec.openTerminal(path);
    res.json({ success: true });
  });

  app.post('/api/actions/open-folder', (req, res) => {
    void (async () => {
      const { path } = req.body as { path: string };
      await exec.openFolder(path);
      res.json({ success: true });
    })();
  });

  app.post('/api/projects/git-pull', (req, res) => {
    void (async () => {
      try {
        const { path } = req.body as { path: string };
        await projects.gitPull(path);
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  app.post('/api/projects/git-push', (req, res) => {
    void (async () => {
      try {
        const { path } = req.body as { path: string };
        await projects.gitPush(path);
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  // Bookmarks
  app.get('/api/bookmarks', (req, res) => {
    res.json(db.data.bookmarks);
  });

  app.post('/api/bookmarks', (req, res) => {
    void (async () => {
      try {
        const bookmark = req.body as Bookmark;
        // Check if exists
        const idx = db.data.bookmarks.findIndex(b => b.id === bookmark.id);
        if (idx >= 0) db.data.bookmarks[idx] = bookmark;
        else db.data.bookmarks.push(bookmark);
        
        await db.write();
        res.json(db.data.bookmarks);
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    })();
  });

  app.post('/api/bookmarks/remove', (req, res) => {
    void (async () => {
      const { id } = req.body as { id: string };
      db.data.bookmarks = db.data.bookmarks.filter(b => b.id !== id);
      await db.write();
      res.json({ success: true });
    })();
  });

  // Utils
  app.post('/api/utils/fetch-metadata', (req, res) => {
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
});
