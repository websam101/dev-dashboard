<!--
  Copyright (C) 2025-2026 Sam <websam101@gmail.com>

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card
          flat
          bordered
          class="rounded-borders shadow-1"
        >
          <q-card-section class="bg-gradient-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon
                name="mdi-cogs"
                color="white"
                class="q-mr-sm"
                size="24px"
              />
              <div class="text-h6 text-weight-bolder">{{ $t('settings.title') }}</div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <!-- Appearance -->
            <div class="text-overline text-wcag-bold opacity-70 q-mb-sm">
              <q-icon name="mdi-palette" color="white" class="q-mr-sm" size="24px" />
              {{ $t('settings.appearance') }}
            </div>
            <q-list
              bordered
              separator
              class="rounded-borders q-mb-lg"
            >
              <q-item
                tag="label"
                v-ripple
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ $t('settings.language') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-select
                    v-model="settingsStore.settings.locale"
                    :options="localeOptions"
                    dense
                    outlined
                    emit-value
                    map-options
                    options-dense
                    style="min-width: 120px"
                  />
                </q-item-section>
                <q-tooltip>{{ $t('settings.languageHint') }}</q-tooltip>
              </q-item>

              <q-item
                tag="label"
                v-ripple
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ $t('settings.darkMode') }}</q-item-label>
                  <q-item-label
                    caption
                    class="text-wcag-caption"
                  >{{ $t('settings.darkModeDesc') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="settingsStore.settings.darkMode"
                    color="primary"
                  />
                </q-item-section>
                <q-tooltip>{{ $t('settings.darkModeHint') }}</q-tooltip>
              </q-item>

            </q-list>

            <!-- Automation -->
            <div class="text-overline text-wcag-bold opacity-70 q-mb-sm">
              <q-icon name="mdi-creation" color="white" class="q-mr-sm" size="24px" />
              {{ $t('settings.automation') }}
            </div>
            <q-list
              bordered
              separator
              class="rounded-borders q-mb-lg"
            >
              <q-item
                tag="label"
                v-ripple
                v-if="hasBackend"
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ $t('settings.showSystemStats') }}</q-item-label>
                  <q-item-label
                    caption
                    class="text-wcag-caption"
                  >{{ $t('settings.showSystemStatsDesc') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="settingsStore.settings.showSystemStats"
                    color="accent"
                  />
                </q-item-section>
                <q-tooltip>{{ $t('settings.showSystemStatsHint') }}</q-tooltip>
              </q-item>

              <q-item
                tag="label"
                v-ripple
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ $t('settings.autoCheckPorts') }}</q-item-label>
                  <q-item-label
                    caption
                    class="text-wcag-caption"
                  >{{ $t('settings.autoCheckPortsDesc') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="settingsStore.settings.autoCheckPorts"
                    color="secondary"
                  />
                </q-item-section>
                <q-tooltip>{{ $t('settings.autoCheckPortsHint') }}</q-tooltip>
              </q-item>

            </q-list>

            <!-- Managed Roots -->
            <div v-if="hasBackend">
              <div class="text-overline text-wcag-bold opacity-70 q-mb-sm">
                <q-icon name="mdi-file-tree" color="white" class="q-mr-sm" size="24px" />
                {{ $t('settings.scanRoots') }}
              </div>
              <div class="row q-gutter-sm q-mb-md">
                <q-input
                  v-model="newRoot"
                  :placeholder="$t('settings.rootPathPlaceholder')"
                  dense
                  outlined
                  class="col"
                  @keyup.enter="addRoot"
                />
                <q-btn
                  v-if="isElectron"
                  outline
                  color="secondary"
                  icon="mdi-folder"
                  @click="browseFolder"
                  :aria-label="$t('settings.browseFolderHint')"
                >
                  <q-tooltip>{{ $t('settings.browseFolderHint') }}</q-tooltip>
                </q-btn>
                <q-btn
                  color="primary"
                  :label="$t('settings.addRoot')"
                  @click="addRoot"
                  :disable="!newRoot"
                >
                  <q-tooltip>{{ $t('settings.addRootHint') }}</q-tooltip>
                </q-btn>
              </div>

              <q-list
                bordered
                separator
                class="rounded-borders bg-root-list q-mb-lg"
                v-if="settingsStore.settings.scanRoots?.length"
              >
                <q-item
                  v-for="root in settingsStore.settings.scanRoots"
                  :key="root"
                  dense
                  class="q-py-sm"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="mdi-folder"
                      color="primary"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label
                      class="text-wcag text-weight-medium ellipsis"
                      style="max-width: 400px"
                    >{{ root }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="mdi-delete"
                      color="negative"
                      size="sm"
                      @click="removeRoot(root)"
                      :aria-label="$t('common.remove')"
                    >
                      <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
              <div
                v-else
                class="text-center q-pa-md text-wcag-caption italic border-dashed rounded-borders q-mb-lg"
              >
                {{ $t('settings.noRoots') }}
              </div>
            </div>

            <!-- DEV TOOLS (Hidden in Production or if no backend) -->
            <div
              v-if="isDev && hasBackend"
              class="dev-tools-section q-mt-xl q-pa-md rounded-borders border-dashed"
            >
              <div class="row items-center q-mb-md">
                <q-icon
                  name="mdi-bug"
                  color="warning"
                  class="q-mr-sm"
                  size="20px"
                />
                <div class="text-overline text-wcag-bold">{{ $t('settings.devTools') }}</div>
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-btn
                    outline
                    color="primary"
                    icon="mdi-database-export"
                    :label="$t('settings.pushLocalToBackend')"
                    class="full-width"
                    dense
                    @click="forcePush"
                    :loading="syncing"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    outline
                    color="secondary"
                    icon="mdi-database-import"
                    :label="$t('settings.pullBackendToLocal')"
                    class="full-width"
                    dense
                    @click="forcePull"
                    :loading="syncing"
                  />
                </div>
              </div>
              <div class="text-caption text-wcag-caption q-mt-sm italic">
                {{ $t('settings.syncHint') }}
              </div>
            </div>

            <!-- Backup & Restore -->
            <div class="q-mt-xl q-pa-md rounded-borders border-subtle bg-glass shadow-1">
              <div class="row items-center q-mb-md">
                <q-icon
                  name="mdi-database-lock"
                  color="primary"
                  class="q-mr-sm"
                  size="20px"
                />
                <div class="text-overline text-wcag-bold">{{ $t('settings.backupRestore') }}</div>
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  :label="$t('settings.exportBackup')"
                  icon="mdi-download"
                  unelevated
                  size="sm"
                  @click="exportBackup"
                />
                <q-btn
                  outline
                  color="secondary"
                  :label="$t('settings.importBackup')"
                  icon="mdi-upload"
                  size="sm"
                  @click="triggerImport"
                />
                <input
                  type="file"
                  ref="backupInput"
                  @change="importBackup"
                  style="display: none"
                  accept=".json"
                />
              </div>
              <div class="text-wcag-caption q-mt-sm opacity-70">{{ $t('settings.backupHint') }}</div>
            </div>
          </q-card-section>

          <q-card-actions
            align="right"
            class="q-pa-md border-top"
          >
            <q-btn
              color="primary"
              :label="$t('common.save')"
              unelevated
              :loading="settingsStore.loading"
              @click="settingsStore.saveSettings"
              class="text-weight-bolder"
            >
              <q-tooltip>{{ $t('settings.saveAllHint') }}</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { agnosticDataService } from '../../services/db/AgnosticDataService';
import { hasBackend } from '../../boot/api';
import { useQuasar, exportFile } from 'quasar';

const $q = useQuasar();
const settingsStore = useSettingsStore();
const bookmarksStore = useBookmarksStore();
const projectsStore = useProjectsStore();

const newRoot = ref('');
const syncing = ref(false);
const backupInput = ref<HTMLInputElement | null>(null);
const isElectron = computed(() => !!(window as any).electronApi);
const isDev = computed(() => process.env.DEV);

const localeOptions = [
  { label: 'English', value: 'en-US' },
  { label: 'FranÃ§ais', value: 'fr' }
];

const addRoot = () => {
  if (newRoot.value && !settingsStore.settings.scanRoots.includes(newRoot.value)) {
    settingsStore.settings.scanRoots.push(newRoot.value);
    newRoot.value = '';
  }
};

const removeRoot = (root: string) => {
  settingsStore.settings.scanRoots = settingsStore.settings.scanRoots.filter(r => r !== root);
};

const browseFolder = async () => {
  const path = await (window as any).electronApi.selectFolder();
  if (path) newRoot.value = path;
};

const forcePush = async () => {
  syncing.value = true;
  try {
    await bookmarksStore.forcePushToBackend();
    await projectsStore.forcePushToBackend();
    $q.notify({ message: 'Local data pushed to backend', color: 'positive' });
  } finally {
    syncing.value = false;
  }
};

const forcePull = async () => {
  syncing.value = true;
  try {
    await bookmarksStore.forcePullFromBackend();
    await projectsStore.forcePullFromBackend();
    $q.notify({ message: 'Backend data pulled to local store', color: 'positive' });
  } finally {
    syncing.value = false;
  }
};

// --- Backup & Restore Logic ---
const exportBackup = async () => {
  try {
    const data = await agnosticDataService.exportAllData();
    const status = exportFile(
      `dev-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`,
      data,
      'application/json'
    );
    if (status === true) {
      $q.notify({ message: 'Backup exported successfully', color: 'positive', icon: 'mdi-check' });
    }
  } catch (e) {
    $q.notify({ message: 'Backup failed', color: 'negative', icon: 'mdi-alert' });
  }
};

const triggerImport = () => {
  backupInput.value?.click();
};

const importBackup = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  $q.dialog({
    title: 'Confirm Restore',
    message: 'This will overwrite ALL current local data (Projects, Bookmarks, Settings). Continue?',
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(() => {
    void (async () => {
      try {
        const text = await file.text();
        await agnosticDataService.importAllData(text);

        // Reload stores to reflect new data
        await Promise.all([
          settingsStore.loadSettings(),
          projectsStore.loadProjects(true),
          bookmarksStore.loadBookmarks()
        ]);

        $q.notify({ message: 'Restore complete! Lab updated.', color: 'positive', icon: 'mdi-check' });
      } catch (e) {
        $q.notify({ message: 'Import failed: Invalid file', color: 'negative', icon: 'mdi-alert' });
      } finally {
        if (backupInput.value) backupInput.value.value = '';
      }
    })();
  });
};

onMounted(() => {
  // Global settings already loaded in App.vue
});
</script>

<style lang="sass" scoped>
.border-dashed
  border: 2px dashed var(--dd-border)

.bg-root-list
  background: #fff

.body--dark .bg-root-list
  background: rgba(0, 0, 0, 0.2)

.dev-tools-section
  background: rgba(var(--dd-warning), 0.05)

.border-subtle
  border: 1px solid rgba(255, 255, 255, 0.1)

.bg-glass
  background: rgba(var(--dd-bg-rgb), 0.6)
  backdrop-filter: blur(10px)
</style>
