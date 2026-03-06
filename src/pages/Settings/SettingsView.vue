<template>
  <q-page class="q-pa-lg">
    <div class="row q-mb-xl">
      <div class="col-12">
        <div class="text-h4 text-weight-bold q-mb-xs">{{ $t('settings.title') }}</div>
        <div class="text-subtitle1 opacity-70">{{ $t('settings.caption') }}</div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Appearance Section -->
      <div class="col-12 col-md-6">
        <q-card bordered flat class="rounded-borders">
          <q-card-section>
            <div class="text-h6 q-mb-md row items-center">
              <q-icon name="palette" color="primary" class="q-mr-sm" />
              {{ $t('settings.appearance') }}
            </div>
            
            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('settings.darkMode') }}</q-item-label>
                  <q-item-label caption>{{ $t('settings.darkModeCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="settingsStore.settings.darkMode" color="primary" @update:model-value="saveSettings" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label>{{ $t('settings.language') }}</q-item-label>
                  <q-item-label caption>{{ $t('settings.languageCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-select
                    v-model="locale"
                    :options="languageOptions"
                    dense
                    outlined
                    emit-value
                    map-options
                    style="min-width: 150px"
                    @update:model-value="onLanguageChange"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Automation Section -->
      <div class="col-12 col-md-6">
        <q-card bordered flat class="rounded-borders">
          <q-card-section>
            <div class="text-h6 q-mb-md row items-center">
              <q-icon name="settings_suggest" color="secondary" class="q-mr-sm" />
              {{ $t('settings.automation') }}
            </div>
            
            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('settings.autoCheckPorts') }}</q-item-label>
                  <q-item-label caption>{{ $t('settings.autoCheckPortsCaption') }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="settingsStore.settings.autoCheckPorts" color="secondary" @update:model-value="saveSettings" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Workspace Section -->
      <div class="col-12">
        <q-card bordered flat class="rounded-borders">
          <q-card-section>
            <div class="text-h6 q-mb-sm row items-center">
              <q-icon name="workspaces" color="accent" class="q-mr-sm" />
              {{ $t('settings.scanRoots') }}
            </div>
            <div class="text-caption opacity-70 q-mb-lg">{{ $t('settings.scanRootsCaption') }}</div>

            <div class="row q-gutter-md items-center q-mb-lg">
              <q-input 
                v-model="newRoot" 
                :placeholder="$t('settings.rootPathPlaceholder')" 
                outlined 
                dense 
                class="col" 
                @keyup.enter="addRoot"
              />
              <q-btn v-if="isElectron" outline color="secondary" icon="folder" @click="browseFolder" />
              <q-btn color="primary" :label="$t('settings.addRoot')" @click="addRoot" :disable="!newRoot" />
            </div>

            <q-list bordered separator v-if="settingsStore.settings.scanRoots?.length">
              <q-item v-for="root in settingsStore.settings.scanRoots" :key="root">
                <q-item-section avatar>
                  <q-icon name="folder" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ root }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="delete" color="negative" @click="removeRoot(root)" />
                </q-item-section>
              </q-item>
            </q-list>
            
            <div v-else class="text-center q-pa-lg opacity-50 italic">
              {{ $t('settings.noRoots') }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Save Indicator -->
    <q-inner-loading :showing="settingsStore.loading">
      <q-spinner-cube size="50px" color="primary" />
      <div class="q-mt-sm">{{ $t('settings.saving') }}</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const settingsStore = useSettingsStore();
const { locale, t } = useI18n();

const newRoot = ref('');

const languageOptions = [
  { label: 'English', value: 'en-US' },
  { label: 'Français', value: 'fr' }
];

const isElectron = computed(() => typeof window !== 'undefined' && !!(window as any).electronApi);

const onLanguageChange = (val: string) => {
  locale.value = val;
  // We should ideally persist this in settingsStore too if we want it global
};

const saveSettings = async () => {
  await settingsStore.saveSettings();
  $q.notify({
    message: t('settings.settingsSaved'),
    color: 'positive',
    icon: 'cloud_done',
    position: 'bottom-right',
    timeout: 1000
  });
};

const addRoot = () => {
  if (newRoot.value && !settingsStore.settings.scanRoots.includes(newRoot.value)) {
    settingsStore.settings.scanRoots.push(newRoot.value);
    newRoot.value = '';
    void saveSettings();
  }
};

const removeRoot = (root: string) => {
  settingsStore.settings.scanRoots = settingsStore.settings.scanRoots.filter(r => r !== root);
  void saveSettings();
};

const browseFolder = async () => {
  if (typeof window !== 'undefined' && (window as any).electronApi) {
    const path = await (window as any).electronApi.selectFolder();
    if (path && !settingsStore.settings.scanRoots.includes(path)) {
      settingsStore.settings.scanRoots.push(path);
      void saveSettings();
    }
  }
};

onMounted(() => {
  void settingsStore.loadSettings();
});
</script>

<style lang="sass" scoped>
.rounded-borders
  border-radius: 12px

.opacity-70
  opacity: 0.7
.opacity-50
  opacity: 0.5
</style>
