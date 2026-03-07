import fs from 'node:fs/promises';
import path from 'node:path';
import { simpleGit } from 'simple-git';
import type { SimpleGit } from 'simple-git';
import si from 'systeminformation';

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  techs: string[];
  git?: {
    branch: string;
    isDirty: boolean;
    ahead: number;
    behind: number;
    lastCommit: string;
    url?: string | undefined;
  } | undefined;
  ports: number[];
  managedPorts?: number[];
}

export class ProjectManager {
  private isSyncing = false;
  private lastSyncResults: ProjectInfo[] = [];
  private lastSyncTime = 0;

  async getGitInfo(projectPath: string): Promise<ProjectInfo['git']> {
    try {
      const git: SimpleGit = simpleGit(projectPath);
      const isRepo = await git.checkIsRepo();
      if (!isRepo) return undefined;

      const [status, branch, remote] = await Promise.all([
        git.status(),
        git.revparse(['--abbrev-ref', 'HEAD']),
        git.remote(['get-url', 'origin']).catch(() => undefined)
      ]);

      const log = await git.log({ maxCount: 1 });

      return {
        branch,
        isDirty: !status.isClean(),
        ahead: status.ahead,
        behind: status.behind,
        lastCommit: log.latest?.date || '',
        url: typeof remote === 'string' ? remote.trim() : undefined
      };
    } catch {
      return undefined;
    }
  }

  async detectTechs(projectPath: string): Promise<string[]> {
    const techs: string[] = [];
    try {
      const files = await fs.readdir(projectPath);
      if (files.includes('package.json')) {
        techs.push('nodejs');
        const pkg = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.vue) techs.push('vue');
        if (deps.react) techs.push('react');
        if (deps.quasar) techs.push('quasar');
        if (deps.typescript) techs.push('typescript');
      }
      if (files.includes('requirements.txt') || files.includes('pyproject.toml')) techs.push('python');
      if (files.includes('go.mod')) techs.push('go');
      if (files.includes('Cargo.toml')) techs.push('rust');
      if (files.includes('composer.json')) techs.push('php');
      if (files.includes('docker-compose.yml') || files.includes('Dockerfile')) techs.push('docker');
    } catch { /* ignore */ }
    return techs;
  }

  async getActivePorts(): Promise<Map<number, number>> {
    const ports = new Map<number, number>();
    try {
      const network = await si.networkConnections();
      for (const conn of network) {
        if (conn.state === 'LISTEN' && conn.localPort) {
          const p = parseInt(conn.localPort);
          if (!isNaN(p)) ports.set(p, conn.pid || 0);
        }
      }
    } catch { /* ignore */ }
    return ports;
  }

  async scanDirectory(rootPath: string): Promise<ProjectInfo[]> {
    const projects: ProjectInfo[] = [];
    try {
      const entries = await fs.readdir(rootPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(rootPath, entry.name);
          const [git, techs] = await Promise.all([
            this.getGitInfo(fullPath),
            this.detectTechs(fullPath)
          ]);

          if (techs.length > 0 || git) {
            projects.push({
              id: Buffer.from(fullPath).toString('base64'),
              name: entry.name,
              path: fullPath,
              techs,
              git,
              ports: []
            });
          }
        }
      }
    } catch (e) {
      console.error('Scan failed', e);
    }
    return projects;
  }

  async gitPull(projectPath: string): Promise<void> {
    const git: SimpleGit = simpleGit(projectPath);
    await git.pull();
  }

  async gitPush(projectPath: string): Promise<void> {
    const git: SimpleGit = simpleGit(projectPath);
    await git.push();
  }

  async syncAll(projects: ProjectInfo[]): Promise<ProjectInfo[]> {
    // 1. Throttle: If we synced in the last 2 seconds, return previous results
    const now = Date.now();
    if (this.isSyncing || (now - this.lastSyncTime < 2000)) {
      return this.lastSyncResults.length > 0 ? this.lastSyncResults : projects;
    }

    this.isSyncing = true;
    try {
      const updated: ProjectInfo[] = [];
      // Use chunks or limited concurrency if project list is huge
      // For now, we'll keep simple Promise.all but be mindful
      const tasks = projects.map(async (p) => {
        const [git, techs] = await Promise.all([
          this.getGitInfo(p.path),
          this.detectTechs(p.path)
        ]);
        return { ...p, git, techs };
      });

      this.lastSyncResults = await Promise.all(tasks);
      this.lastSyncTime = Date.now();
      return this.lastSyncResults;
    } finally {
      this.isSyncing = false;
    }
  }
}
