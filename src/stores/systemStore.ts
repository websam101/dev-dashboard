import { defineStore } from 'pinia';
import { api, hasBackend } from '../boot/api';
import { useSettingsStore } from './settingsStore';

export interface SystemStats {
  cpuLoad: number;
  cpuCores: number;
  memTotal: number;
  memUsed: number;
  memPercent: number;
  diskTotal: number;
  diskUsed: number;
  diskPercent: number;
  loadAvg: number[];
  netSent: number;
  netRecv: number;
  uptime: number;
  platform: string;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  icon: string;
  color: string;
}

export const useSystemStore = defineStore('system', {
  state: () => ({
    stats: null as SystemStats | null,
    notifications: [] as Notification[],
    loading: false,
    isFetching: false
  }),
  actions: {
    async fetchStats() {
      const settingsStore = useSettingsStore();
      if (this.isFetching || !hasBackend || !settingsStore.settings.showSystemStats) return;
      
      this.isFetching = true;
      try {
        const response = await api.get('/api/system/stats');
        this.stats = response.data;
      } catch (e) {
        console.error('Failed to fetch system stats', e);
      } finally {
        this.isFetching = false;
      }
    },
    async checkPort(port: number): Promise<boolean> {
      if (!hasBackend) return false;
      try {
        const response = await api.post('/api/utils/check-port', { port });
        return !!response.data.inUse;
      } catch (e) {
        console.error('Failed to check port', e);
        return false;
      }
    },
    async openTaskManager() {
      if (!hasBackend) return;
      try {
        await api.post('/api/actions/open-task-manager');
      } catch (e) {
        console.error('Failed to open task manager', e);
      }
    },
    addNotification(notif: Omit<Notification, 'id' | 'time'>) {
      this.notifications.unshift({
        ...notif,
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString()
      });
      if (this.notifications.length > 10) {
        this.notifications.pop();
      }
    },
    clearNotifications() {
      this.notifications = [];
    }
  }
});
