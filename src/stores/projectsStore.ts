import { defineStore } from 'pinia';
import { api } from '../boot/axios';

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
}

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    loading: false
  }),
  actions: {
    async loadProjects() {
      this.loading = true;
      try {
        const response = await api.get('/api/projects');
        this.projects = Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error('Failed to load projects', e);
        this.projects = [];
      } finally {
        this.loading = false;
      }
    },
    async scanDirectory(rootPath: string) {
      this.loading = true;
      try {
        const response = await api.post('/api/projects/scan', { rootPath });
        this.projects = Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error('Scan failed', e);
      } finally {
        this.loading = false;
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
      this.loading = true;
      try {
        const response = await api.post('/api/projects/sync-all');
        this.projects = Array.isArray(response.data) ? response.data : [];
      } finally {
        this.loading = false;
      }
    }
  }
});
