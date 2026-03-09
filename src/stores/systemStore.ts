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
import { useSettingsStore } from './settingsStore';
import { useProjectsStore } from './projectsStore';

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
    checkPortOwnership(port: number): string | null {
      const projectsStore = useProjectsStore();
      const owner = projectsStore.projects.find(p => 
        (p.ports && p.ports.includes(port)) || 
        (p.managedPorts && p.managedPorts.includes(port))
      );
      return owner ? owner.name : null;
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
