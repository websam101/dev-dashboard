import { defineStore } from "pinia";
import { api } from '../boot/api';
import { IndexedDbAdapter } from "../services/db/adapter/IndexedDbAdapter";
import { Dark } from 'quasar';
import { watch } from 'vue';

export interface Settings {
  darkMode: boolean;
  autoCheckPorts: boolean;
  portCheckInterval: number;
  scanRoots: string[];
  locale: string;
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
      scanRoots: [],
      locale: 'en-US'
    } as Settings,
    loading: false,
    initialized: false
  }),
  actions: {
    applyTheme() {
      Dark.set(this.settings.darkMode);
    },
    async init() {
      if (this.initialized) return;
      
      // 1. Load settings first to avoid unnecessary immediate saves of default values
      await this.loadSettings();

      // 2. Setup internal watch for Dark Mode (UI side-effect)
      watch(() => this.settings.darkMode, (isDark) => {
        Dark.set(isDark);
        void this.saveSettings(); // Auto-save on change
      }, { immediate: true });

      // 3. Setup internal watch for Locale (Persistence side-effect)
      // Note: App.vue handles the actual i18n.locale.value sync
      watch(() => this.settings.locale, () => {
        void this.saveSettings(); // Auto-save on change
      });

      this.initialized = true;
    },
    async loadSettings() {
      if (!process.env.CLIENT) return;
      
      this.loading = true;
      try {
        // 1. Load from IndexedDB
        const local = await db.getSetting<Settings>('app_settings');
        if (local) {
          // Careful merge to not lose defaults if local is old
          this.settings = { ...this.settings, ...local };
        }

        // 2. Optional Sync with Backend
        try {
          const response = await api.get('/api/settings');
          if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
            this.settings = { ...this.settings, ...response.data };
            await db.setSetting('app_settings', clean(this.settings));
          }
        } catch (e) {
          // Ignore sync failures
        }
        
        if (!this.settings.locale) this.settings.locale = 'en-US';
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        this.loading = false;
      }
    },
    async saveSettings() {
      if (!process.env.CLIENT) return;

      // Use a lock-like mechanism if needed, but for settings, a simple debounce or immediate is usually fine
      try {
        const plainSettings = clean(this.settings);
        
        // 1. Save to IndexedDB
        await db.setSetting('app_settings', plainSettings);

        // 2. Optional Sync to Backend
        void api.post('/api/settings', plainSettings).catch(() => {});
      } catch (e) {
        console.error("Failed to save settings locally", e);
      }
    }
  }
});
