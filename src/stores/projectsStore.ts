import { defineStore } from 'pinia';
import { api } from '../boot/axios';
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
}

const db = new IndexedDbAdapter();
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    loading: false
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
          managedPorts: p.managedPorts || []
        }));

        try {
          const response = await api.get('/api/projects');
          if (Array.isArray(response.data) && response.data.length > 0) {
            this.projects = response.data;
            for (const p of this.projects) {
              await db.addProject(clean({
                id: p.id,
                name: p.name,
                path: p.path,
                description: '',
                ports: p.ports || [],
                techs: p.techs,
                git: p.git,
                managedPorts: (p as any).managedPorts || []
              } as any));
            }
          }
        } catch (e) {
          // Ignore sync failure
        }
      } catch (e) {
        console.error('Failed to load projects', e);
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
          this.projects = response.data;
          for (const p of this.projects) {
            await db.addProject(clean({
              id: p.id,
              name: p.name,
              path: p.path,
              description: '',
              ports: p.ports || [],
              techs: p.techs,
              git: p.git,
              managedPorts: (p as any).managedPorts || []
            } as any));
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
          await db.addProject(clean(project as any));
        }
      }
    },
    async removeManagedPort(projectId: string, port: number) {
      if (!process.env.CLIENT) return;
      const project = this.projects.find(p => p.id === projectId);
      if (project && project.managedPorts) {
        project.managedPorts = project.managedPorts.filter(p => p !== port);
        await db.addProject(clean(project as any));
      }
    },
    async openVsCode(path: string) {
      await api.post('/api/actions/open-code', { path });
    },
    async openTerminal(path: string) {
      await api.post('/api/actions/open-terminal', { path });
    },
    async openFolder(path: string) {
      await api.post('/api/actions/open-folder', { path });
    },
    async gitPull(path: string) {
      await api.post('/api/projects/git-pull', { path });
      await this.loadProjects();
    },
    async gitPush(path: string) {
      await api.post('/api/projects/git-push', { path });
      await this.loadProjects();
    },
    async syncAll() {
      if (!process.env.CLIENT) return;

      this.loading = true;
      try {
        const response = await api.post('/api/projects/sync-all');
        const remoteProjects = Array.isArray(response.data) ? response.data : [];
        
        // Merge managed ports from local to synced data
        this.projects = remoteProjects.map((rp: any) => {
          const local = this.projects.find(p => p.id === rp.id);
          return {
            ...rp,
            managedPorts: local?.managedPorts || []
          };
        });

        for (const p of this.projects) {
          await db.addProject(clean(p as any));
        }
      } finally {
        this.loading = false;
      }
    }
  }
});
