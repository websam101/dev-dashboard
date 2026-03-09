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
import { defineStore } from "pinia";
import { api } from '../boot/api';
import { agnosticDataService } from "../services/db/AgnosticDataService";
import { Dark, debounce } from 'quasar';
import { watch } from 'vue';

export interface Settings {
  darkMode: boolean;
  autoCheckPorts: boolean;
  portCheckInterval: number;
  scanRoots: string[];
  locale: string;
  showSystemStats: boolean;
}

// Helper to ensure we have a clean object without Vue Proxies
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    settings: {
      darkMode: true,
      autoCheckPorts: true,
      portCheckInterval: 30000,
      scanRoots: [],
      locale: 'en-US',
      showSystemStats: true
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

      // 2. Apply theme immediately after loading (before setting up watch)
       Dark.set(this.settings.darkMode);

      // 3. Setup internal watch for Dark Mode (UI side-effect)
      watch(() => this.settings.darkMode, (isDark) => {
        Dark.set(isDark);
        void this.debouncedSave(); // Auto-save on change
      });

      // 4. Setup internal watch for Locale (Persistence side-effect)
      watch(() => this.settings.locale, () => {
        void this.debouncedSave(); // Auto-save on change
      });

      // 5. Setup internal watch for other settings
      watch(() => this.settings.showSystemStats, () => {
        void this.debouncedSave();
      });

      this.initialized = true;
    },
    async loadSettings() {
      if (!process.env.CLIENT) return;
      
      this.loading = true;
      try {
        // 1. Load from Agnostic Service (Local-First)
        const local = await agnosticDataService.getSetting<Settings>('app_settings');
        if (local) {
          // Careful merge to not lose defaults if local is old
          this.settings = { ...this.settings, ...local };
        }

        // 2. Optional Sync with Backend (if supported by service)
        // AgnosticDataService handles the orchestration, but we can still pull if needed
        try {
          const response = await api.get('/api/settings');
          if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
            this.settings = { ...this.settings, ...response.data };
            await agnosticDataService.setSetting('app_settings', clean(this.settings));
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
    debouncedSave: debounce(function(this: any) {
      void this.saveSettings();
    }, 1000),
    async saveSettings() {
      if (!process.env.CLIENT) return;

      try {
        const plainSettings = clean(this.settings);
        await agnosticDataService.setSetting('app_settings', plainSettings);
      } catch (e) {
        console.error("Failed to save settings", e);
      }
    }
  }
});
