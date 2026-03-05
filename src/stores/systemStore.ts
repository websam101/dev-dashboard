import { defineStore } from 'pinia';
import { api } from '../boot/axios';

export interface SystemStats {
  cpuLoad: number;
  memTotal: number;
  memUsed: number;
  memPercent: number;
  diskTotal: number;
  diskUsed: number;
  diskPercent: number;
  uptime: number;
  platform: string;
}

export const useSystemStore = defineStore('system', {
  state: () => ({
    stats: null as SystemStats | null,
    loading: false
  }),
  actions: {
    async fetchStats() {
      try {
        const response = await api.get('/api/system/stats');
        this.stats = response.data;
      } catch (e) {
        console.error('Failed to fetch system stats', e);
      }
    }
  }
});
