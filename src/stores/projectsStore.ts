import { defineStore } from 'pinia';
import { api } from '../boot/api';
import { IndexedDbAdapter } from '../services/db/adapter/IndexedDbAdapter';

export interface Project {
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
    url?: string;
  };
  ports: number[];
  managedPorts?: number[];
  favorite?: boolean;
}

const db = new IndexedDbAdapter();
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    loading: false,
    isSyncing: false
  }),
  actions: {
    async loadProjects() {
      if (!process.env.CLIENT) return;

      this.loading = true;
      try {
        const local = await db.getProjects();
        this.projects = local.map(p => ({
          id: p.id,
          name: p.name,
          path: p.path,
          techs: p.techs || [],
          git: p.git,
          ports: p.ports || [],
          managedPorts: p.managedPorts || [],
          favorite: !!p.favorite
        }));

        try {
          const response = await api.get('/api/projects');
          if (Array.isArray(response.data)) {
            const remoteProjects = response.data;
            for (const rp of remoteProjects) {
              const localMatch = this.projects.find(p => p.id === rp.id);
              const merged = {
                ...rp,
                managedPorts: rp.managedPorts || localMatch?.managedPorts || [],
                favorite: rp.favorite !== undefined ? rp.favorite : (localMatch?.favorite || false)
              };
              const idx = this.projects.findIndex(p => p.id === rp.id);
              if (idx >= 0) this.projects[idx] = merged;
              else this.projects.push(merged);
              await db.addProject(clean({ ...merged, description: '' }));
            }
          }
        } catch (e) { /* sync failure ignored */ }
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
        await db.addProject(clean({ ...project, description: '' }));
        void api.post('/api/projects/update', clean(project)).catch(() => {});
      }
    },
    async forcePushToBackend() {
      if (!process.env.CLIENT) return;
      this.loading = true;
      try {
        await api.post('/api/projects/sync', clean(this.projects));
      } finally {
        this.loading = false;
      }
    },
    async forcePullFromBackend() {
      if (!process.env.CLIENT) return;
      this.loading = true;
      try {
        const response = await api.get('/api/projects');
        if (Array.isArray(response.data)) {
          const existing = await db.getProjects();
          for (const ex of existing) await db.deleteProject(ex.id);
          for (const remote of response.data) {
            await db.addProject(clean({ ...remote, description: '' }));
          }
          await this.loadProjects();
        }
      } finally {
        this.loading = false;
      }
    },
    async scanDirectory(rootPath: string) {
      if (!process.env.CLIENT) return;
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
            await db.addProject(clean({ ...merged, description: '' }));
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
        await db.deleteProject(id);
        this.projects = this.projects.filter(p => p.id !== id);
        void api.post('/api/projects/remove', { id }).catch(() => {});
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
          await db.addProject(clean({ ...project, description: '' }));
          void api.post('/api/projects/update', clean(project)).catch(() => {});
        }
      }
    },
    async removeManagedPort(projectId: string, port: number) {
      if (!process.env.CLIENT) return;
      const project = this.projects.find(p => p.id === projectId);
      if (project && project.managedPorts) {
        project.managedPorts = project.managedPorts.filter(p => p !== port);
        await db.addProject(clean({ ...project, description: '' }));
        void api.post('/api/projects/update', clean(project)).catch(() => {});
      }
    },
    async openVsCode(path: string) { await api.post('/api/actions/open-code', { path }); },
    async openTerminal(path: string) { await api.post('/api/actions/open-terminal', { path }); },
    async openFolder(path: string) { await api.post('/api/actions/open-folder', { path }); },
    async gitPull(path: string) { await api.post('/api/projects/git-pull', { path }); await this.loadProjects(); },
    async gitPush(path: string) { await api.post('/api/projects/git-push', { path }); await this.loadProjects(); },
    async syncAll() {
      if (!process.env.CLIENT || this.isSyncing) return;
      
      this.isSyncing = true;
      try {
        const response = await api.post('/api/projects/sync-all');
        const remoteProjects = Array.isArray(response.data) ? response.data : [];
        
        this.projects = remoteProjects.map((rp: any) => {
          const local = this.projects.find(p => p.id === rp.id);
          return { 
            ...rp, 
            managedPorts: rp.managedPorts || local?.managedPorts || [],
            favorite: local?.favorite || false
          };
        });
        
        for (const p of this.projects) await db.addProject(clean({ ...p, description: '' }));
      } finally { 
        this.isSyncing = false; 
      }
    }
  }
});
