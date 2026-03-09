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
import { defineStore } from 'pinia';
import { api, hasBackend } from '../boot/api';
import { agnosticDataService } from '../services/db/AgnosticDataService';

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  techs: string[];
  git?: {
    branch: string;
    isDirty: boolean;
    ahead: number;
    behind: number;
    lastCommit: string;
    url?: string;
  };
  ports: number[];
  managedPorts?: number[];
  favorite?: boolean;
}

const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    loading: false,
    isSyncing: false,
    hasLoaded: false,
    hasInitiallySynced: false
  }),
  actions: {
    async loadProjects(force = false) {
      if (!process.env.CLIENT) return;
      if (this.hasLoaded && !force) return;

      this.loading = true;
      try {
        const local = await agnosticDataService.getProjects();
        this.projects = local.map(p => ({
          id: p.id,
          name: p.name,
          path: p.path,
          description: p.description || '',
          techs: p.techs || [],
          git: p.git,
          ports: p.ports || [],
          managedPorts: p.managedPorts || [],
          favorite: !!p.favorite
        }));
        this.hasLoaded = true;
      } catch (e) {
        console.error('Failed to load projects', e);
      } finally {
        this.loading = false;
      }
    },
    async toggleFavorite(id: string) {
      const project = this.projects.find(p => p.id === id);
      if (project) {
        project.favorite = !project.favorite;
        await agnosticDataService.saveProject(clean(project));
      }
    },
    async addManualProject(project: Omit<Project, 'id' | 'ports' | 'managedPorts'>) {
      const newProject: Project = {
        ...project,
        id: Buffer.from(project.path || project.name).toString('base64'),
        ports: [],
        managedPorts: [],
        favorite: false
      };
      this.projects.push(newProject);
      await agnosticDataService.saveProject(clean(newProject));
    },
    async forcePushToBackend() {
      if (!process.env.CLIENT || !hasBackend) return;
      this.loading = true;
      try {
        await api.post('/api/projects/sync', clean(this.projects));
      } finally {
        this.loading = false;
      }
    },
    async forcePullFromBackend() {
      if (!process.env.CLIENT || !hasBackend) return;
      this.loading = true;
      try {
        const response = await api.get('/api/projects');
        if (Array.isArray(response.data)) {
          // Clear local and replace with remote (agnostic service handles this if we implement bulk)
          // For now, we'll do it manually via the adapter if needed, but AgnosticService should support it
          const remoteProjects = response.data;
          this.projects = remoteProjects;
          for (const p of remoteProjects) {
            await agnosticDataService.saveProject(clean(p));
          }
        }
      } finally {
        this.loading = false;
      }
    },
    async scanDirectory(rootPath: string) {
      if (!process.env.CLIENT || !hasBackend) return;
      this.loading = true;
      try {
        const response = await api.post('/api/projects/scan', { rootPath });
        if (Array.isArray(response.data)) {
          const remoteProjects = response.data;
          for (const p of remoteProjects) {
            const localMatch = this.projects.find(lp => lp.id === p.id);
            const merged = {
              ...p,
              managedPorts: p.managedPorts || localMatch?.managedPorts || [],
              favorite: localMatch?.favorite || false
            };
            const idx = this.projects.findIndex(lp => lp.id === p.id);
            if (idx >= 0) this.projects[idx] = merged;
            else this.projects.push(merged);
            await agnosticDataService.saveProject(clean(merged));
          }
        }
      } catch (e) {
        console.error('Scan failed', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async deleteProject(id: string) {
      if (!process.env.CLIENT) return;
      try {
        await agnosticDataService.deleteProject(id);
        this.projects = this.projects.filter(p => p.id !== id);
      } catch (e) {
        console.error('Failed to delete project', e);
      }
    },
    async addManagedPort(projectId: string, port: number) {
      if (!process.env.CLIENT) return;
      const project = this.projects.find(p => p.id === projectId);
      if (project) {
        if (!project.managedPorts) project.managedPorts = [];
        if (!project.managedPorts.includes(port)) {
          project.managedPorts.push(port);
          await agnosticDataService.saveProject(clean(project));
        }
      }
    },
    async removeManagedPort(projectId: string, port: number) {
      if (!process.env.CLIENT) return;
      const project = this.projects.find(p => p.id === projectId);
      if (project && project.managedPorts) {
        project.managedPorts = project.managedPorts.filter(p => p !== port);
        await agnosticDataService.saveProject(clean(project));
      }
    },
    async openVsCode(path: string) { if (hasBackend) await api.post('/api/actions/open-code', { path }); },
    async openTerminal(path: string) { if (hasBackend) await api.post('/api/actions/open-terminal', { path }); },
    async openFolder(path: string) { if (hasBackend) await api.post('/api/actions/open-folder', { path }); },
    async gitPull(path: string) { if (hasBackend) { await api.post('/api/projects/git-pull', { path }); await this.loadProjects(); } },
    async gitPush(path: string) { if (hasBackend) { await api.post('/api/projects/git-push', { path }); await this.loadProjects(); } },
    async syncAll(deep = false) {
      if (!process.env.CLIENT || this.isSyncing || !hasBackend) return;
      
      this.isSyncing = true;
      try {
        const response = await api.post('/api/projects/sync-all', { deep });
        const remoteProjects = Array.isArray(response.data) ? response.data : [];
        
        this.projects = remoteProjects.map((rp: any) => {
          const local = this.projects.find(p => p.id === rp.id);
          return { 
            ...rp, 
            managedPorts: rp.managedPorts || local?.managedPorts || [],
            favorite: local?.favorite || false
          };
        });
        
        for (const p of this.projects) await agnosticDataService.saveProject(clean(p));
      } finally { 
        this.isSyncing = false; 
      }
    }
  }
});
