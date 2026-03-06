import { defineStore } from "pinia";
import { api } from "../boot/axios";
import { IndexedDbAdapter } from "../services/db/adapter/IndexedDbAdapter";

export interface Settings {
  darkMode: boolean;
  autoCheckPorts: boolean;
  portCheckInterval: number;
  scanRoots: string[];
}

const db = new IndexedDbAdapter();

// Helper to ensure we have a clean object without Vue Proxies
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    settings: {
      darkMode: true,
      autoCheckPorts: true,
      portCheckInterval: 30000,
      scanRoots: []
    } as Settings,
    loading: false
  }),
  actions: {
    async loadSettings() {
      if (!process.env.CLIENT) return;
      
      this.loading = true;
      try {
        // 1. Load from IndexedDB
        const local = await db.getSetting<Settings>('app_settings');
        if (local) {
          this.settings = { ...this.settings, ...local };
        }

        // 2. Optional Sync with Backend
        try {
          const response = await api.get('/api/settings');
          if (response.data && Object.keys(response.data).length > 0) {
            this.settings = { ...this.settings, ...response.data };
            await db.setSetting('app_settings', clean(this.settings));
          }
        } catch (e) {
          // Ignore sync failures
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        this.loading = false;
      }
    },
    async saveSettings() {
      if (!process.env.CLIENT) return;

      try {
        const plainSettings = clean(this.settings);
        
        // 1. Save to IndexedDB (Immediate)
        await db.setSetting('app_settings', plainSettings);

        // 2. Optional Sync to Backend
        void api.post('/api/settings', plainSettings).catch(() => {});
      } catch (e) {
        console.error("Failed to save settings locally", e);
      }
    }
  }
});
