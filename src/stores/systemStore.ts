import { defineStore } from 'pinia';
import { api } from '../boot/axios';

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
