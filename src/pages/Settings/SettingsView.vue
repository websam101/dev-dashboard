<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card flat bordered class="rounded-borders shadow-1">
          <q-card-section class="bg-gradient-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon name="mdi-palette" color="white" class="q-mr-sm" size="24px" />
              <div class="text-h6 text-weight-bolder">{{ $t('settings.title') }}</div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <!-- Appearance -->
            <div class="text-overline text-wcag-bold opacity-70 q-mb-sm">{{ $t('settings.appearance') }}</div>
            <q-list bordered separator class="rounded-borders q-mb-lg">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ $t('settings.darkMode') }}</q-item-label>
                  <q-item-label caption class="text-wcag-caption">{{ $t('settings.darkModeDesc') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="settingsStore.settings.darkMode" color="primary" />
                </q-item-section>
                <q-tooltip>{{ $t('settings.darkModeHint') }}</q-tooltip>
              </q-item>

              <q-item tag="label" v-ripple>
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
            </q-list>

            <!-- Automation -->
            <div class="text-overline text-wcag-bold opacity-70 q-mb-sm">{{ $t('settings.automation') }}</div>
            <q-list bordered separator class="rounded-borders q-mb-lg">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ $t('settings.autoCheckPorts') }}</q-item-label>
                  <q-item-label caption class="text-wcag-caption">{{ $t('settings.autoCheckPortsDesc') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="settingsStore.settings.autoCheckPorts" color="secondary" />
                </q-item-section>
                <q-tooltip>{{ $t('settings.autoCheckPortsHint') }}</q-tooltip>
              </q-item>
            </q-list>

            <!-- Managed Roots -->
            <div class="text-overline text-wcag-bold opacity-70 q-mb-sm">{{ $t('settings.scanRoots') }}</div>
            <div class="row q-gutter-sm q-mb-md">
              <q-input 
                v-model="newRoot" 
                :placeholder="$t('settings.rootPathPlaceholder')" 
                dense 
                outlined 
                class="col"
                @keyup.enter="addRoot"
              />
              <q-btn v-if="isElectron" outline color="secondary" icon="mdi-folder" @click="browseFolder" :aria-label="$t('settings.browseFolderHint')">
                <q-tooltip>{{ $t('settings.browseFolderHint') }}</q-tooltip>
              </q-btn>
              <q-btn color="primary" :label="$t('settings.addRoot')" @click="addRoot" :disable="!newRoot">
                <q-tooltip>{{ $t('settings.addRootHint') }}</q-tooltip>
              </q-btn>
            </div>

            <q-list bordered separator class="rounded-borders bg-root-list" v-if="settingsStore.settings.scanRoots?.length">
              <q-item v-for="root in settingsStore.settings.scanRoots" :key="root" dense class="q-py-sm">
                <q-item-section avatar>
                  <q-icon name="mdi-folder" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-wcag text-weight-medium ellipsis" style="max-width: 400px">{{ root }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="mdi-delete" color="negative" size="sm" @click="removeRoot(root)" :aria-label="$t('common.remove')">
                    <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-md text-wcag-caption italic border-dashed rounded-borders">
              {{ $t('settings.noRoots') }}
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md border-top">
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

const settingsStore = useSettingsStore();

const newRoot = ref('');
const isElectron = computed(() => !!(window as any).electronApi);

const localeOptions = [
  { label: 'English', value: 'en-US' },
  { label: 'Français', value: 'fr' }
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
</style>
