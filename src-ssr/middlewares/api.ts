import { defineSsrMiddleware } from '#q-app/wrappers';
import { SystemMonitor } from '../../src/services/server/SystemMonitor';
import { ProjectManager } from '../../src/services/server/ProjectManager';
import type { ProjectInfo } from '../../src/services/server/ProjectManager';
import { ActionExecutor } from '../../src/services/server/ActionExecutor';
import { JSONFilePreset } from 'lowdb/node';
import path from 'node:path';
import os from 'node:os';

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
    scanRoots: string[];
  };
}

export default defineSsrMiddleware(async ({ app, resolve }) => {
  const sys = new SystemMonitor();
  const projects = new ProjectManager();
  const exec = new ActionExecutor();

  // Persistence Setup
  const dbFolder = path.join(os.homedir(), '.dev-dashboard');
  try {
    const fs = await import('node:fs/promises');
    await fs.mkdir(dbFolder, { recursive: true });
  } catch (e) {
    console.error('Failed to create DB folder:', e);
  }

  const dbPath = path.join(dbFolder, 'db.json');
  const defaultData: DatabaseSchema = { projects: [], bookmarks: [], settings: { scanRoots: [] } };
  const db = await JSONFilePreset<DatabaseSchema>(dbPath, defaultData);
  await db.read(); // Explicitly read to be sure data is there

  // System Stats
  app.get(resolve.urlPath('api/system/stats'), (req, res) => {
    void (async () => {
      try {
        const stats = await sys.getStats();
        res.json(stats);
      } catch (e) {
        console.error('SYSTEM STATS ERROR:', e);
        res.status(500).json({ error: 'Failed to fetch stats', details: String(e) });
      }
    })();
  });

  // Projects
  app.get(resolve.urlPath('api/projects'), (req, res) => {
    res.json(db.data.projects);
  });

  app.post(resolve.urlPath('api/projects/scan'), (req, res) => {
    void (async () => {
      const { rootPath } = req.body as { rootPath: string };
      if (!rootPath) return res.status(400).json({ error: 'rootPath required' });
      
      const found = await projects.scanDirectory(rootPath);
      const existingPaths = new Set(db.data.projects.map(p => p.path));
      const newOnes = found.filter(p => !existingPaths.has(p.path));
      
      db.data.projects.push(...newOnes);
      await db.write();
      res.json(db.data.projects);
    })();
  });

  app.post(resolve.urlPath('api/projects/remove'), (req, res) => {
    void (async () => {
      const { id } = req.body as { id: string };
      db.data.projects = db.data.projects.filter(p => p.id !== id);
      await db.write();
      res.json({ success: true });
    })();
  });

  // Settings
  app.get(resolve.urlPath('api/settings'), (req, res) => {
    res.json(db.data.settings);
  });

  app.post(resolve.urlPath('api/settings'), (req, res) => {
    void (async () => {
      db.data.settings = req.body;
      await db.write();
      res.json(db.data.settings);
    })();
  });

  // Actions
  app.post(resolve.urlPath('api/actions/open-code'), (req, res) => {
    const { path } = req.body as { path: string };
    exec.openVsCode(path);
    res.json({ success: true });
  });

  app.post(resolve.urlPath('api/actions/open-terminal'), (req, res) => {
    const { path } = req.body as { path: string };
    exec.openTerminal(path);
    res.json({ success: true });
  });

  app.post(resolve.urlPath('api/actions/open-folder'), (req, res) => {
    void (async () => {
      const { path } = req.body as { path: string };
      await exec.openFolder(path);
      res.json({ success: true });
    })();
  });

  app.post(resolve.urlPath('api/projects/git-pull'), (req, res) => {
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

  app.post(resolve.urlPath('api/projects/git-push'), (req, res) => {
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

  app.post(resolve.urlPath('api/projects/sync-all'), (req, res) => {
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

  // Bookmarks
  app.get(resolve.urlPath('api/bookmarks'), (_req, res) => {
    res.json(db.data.bookmarks);
  });

  app.post(resolve.urlPath('api/bookmarks/remove'), (req, res) => {
    void (async () => {
      const { id } = req.body as { id: string };
      db.data.bookmarks = db.data.bookmarks.filter(b => b.id !== id);
      await db.write();
      res.json({ success: true });
    })();
  });

  app.post(resolve.urlPath('api/bookmarks'), (req, res) => {
    void (async () => {
      const bookmark = req.body as Omit<Bookmark, 'id'>;
      db.data.bookmarks.push({ ...bookmark, id: Date.now().toString() });
      await db.write();
      res.json(db.data.bookmarks);
    })();
  });
});
