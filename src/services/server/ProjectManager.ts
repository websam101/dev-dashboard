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
        
        // Frameworks
        if (deps.vue) techs.push('vue');
        if (deps.nuxt || files.includes('nuxt.config.js') || files.includes('nuxt.config.ts')) techs.push('nuxt');
        if (deps.react) techs.push('react');
        if (deps.next || files.includes('next.config.js') || files.includes('next.config.mjs')) techs.push('nextjs');
        if (deps['@angular/core']) techs.push('angular');
        if (deps.svelte) techs.push('svelte');
        if (deps.quasar) techs.push('quasar');
        
        // Backend
        if (deps['@nestjs/core'] || files.includes('nest-cli.json')) techs.push('nestjs');
        if (deps.express) techs.push('express');
        if (deps.fastify) techs.push('fastify');
        
        // Tools & Libs
        if (deps.typescript) techs.push('typescript');
        if (deps.vite) techs.push('vite');
        if (deps.tailwindcss || files.includes('tailwind.config.js') || files.includes('tailwind.config.ts')) techs.push('tailwind');
        if (deps.prisma || files.includes('prisma')) techs.push('prisma');
        if (deps.drizzle || deps['drizzle-orm']) techs.push('drizzle');
        if (deps.supabase || deps['@supabase/supabase-js']) techs.push('supabase');
        if (deps.firebase || deps['firebase-admin']) techs.push('firebase');
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
      // Sequential processing per folder to prevent process spawning bursts
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(rootPath, entry.name);
          const git = await this.getGitInfo(fullPath);
          const techs = await this.detectTechs(fullPath);

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

  async syncAll(projects: ProjectInfo[], deep = false): Promise<ProjectInfo[]> {
    // 1. Throttle: If we synced in the last 10 seconds, return previous results
    const now = Date.now();
    if (this.isSyncing || (now - this.lastSyncTime < 10000)) {
      return this.lastSyncResults.length > 0 ? this.lastSyncResults : projects;
    }

    this.isSyncing = true;
    try {
      const activePorts = await this.getActivePorts();
      const now = Date.now();
      // Strictly on-demand deep sync: only if deep=true
      const shouldDeep = deep;
      
      const results: ProjectInfo[] = [];
      
      // Sequential processing to avoid spawning 100+ git processes at once
      for (const p of projects) {
        const projectPorts: number[] = [];
        if (p.managedPorts) {
          for (const port of p.managedPorts) {
            if (activePorts.has(port)) projectPorts.push(port);
          }
        }

        if (!shouldDeep && p.git && p.techs.length > 0) {
          results.push({ ...p, ports: projectPorts });
          continue;
        }

        // Only do the heavy lifting sequentially
        const [git, techs] = await Promise.all([
          this.getGitInfo(p.path),
          this.detectTechs(p.path)
        ]);
        
        results.push({ ...p, git, techs, ports: projectPorts });
      }

      this.lastSyncResults = results;
      this.lastSyncTime = Date.now();
      return this.lastSyncResults;
    } finally {
      this.isSyncing = false;
    }
  }
}
