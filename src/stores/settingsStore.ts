import { defineStore } from "pinia";
import { api } from "../boot/axios";

export interface Settings {
  darkMode: boolean;
  autoCheckPorts: boolean;
  portCheckInterval: number;
  scanRoots: string[];
}

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
      this.loading = true;
      try {
        const response = await api.get('/api/settings');
        if (response.data) {
          this.settings = { ...this.settings, ...response.data };
        }
      } catch (e) {
        console.error("Failed to load settings from API", e);
      } finally {
        this.loading = false;
      }
    },
    async saveSettings() {
      try {
        await api.post('/api/settings', this.settings);
      } catch (e) {
        console.error("Failed to save settings to API", e);
      }
    }
  }
});
