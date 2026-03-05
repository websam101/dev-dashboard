<template>
  <q-page class="q-pa-lg">
    <div class="row q-mb-xl">
      <div class="col-12">
        <div class="text-h4 text-weight-bold q-mb-xs text-grey-3">Settings</div>
        <div class="text-grey-6">Configure your laboratory environment</div>
      </div>
    </div>

    <div v-if="settingsStore.loading" class="text-center q-pa-xl">
      <q-spinner-cube color="primary" size="3em" />
    </div>

    <div v-else class="row q-col-gutter-lg">
      <!-- Project Roots -->
      <div class="col-12 col-md-7">
        <q-card bordered flat class="bg-grey-9 rounded-borders">
          <q-card-section class="bg-grey-10 text-grey-3">
            <div class="text-h6">Managed Scan Roots</div>
            <div class="text-caption text-grey-6">Directories where your projects are located</div>
          </q-card-section>
          
          <q-card-section>
            <q-list separator class="bg-grey-10 rounded-borders q-pa-sm q-mb-md">
              <q-item v-for="root in settingsStore.settings.scanRoots" :key="root">
                <q-item-section avatar>
                  <q-icon name="folder" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-grey-3">{{ root }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="delete" color="grey-7" size="sm" @click="removeRoot(root)" />
                </q-item-section>
              </q-item>
              
              <q-item v-if="!settingsStore.settings.scanRoots?.length" class="text-center q-pa-lg">
                <q-item-section>
                  <div class="text-grey-6 italic">No scan roots configured</div>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="row q-gutter-sm">
              <q-input v-model="newRoot" label="Add Path Manually" dense filled dark color="primary" class="col" @keyup.enter="addRoot" />
              <q-btn v-if="isElectron" color="secondary" icon="search" label="Browse" unelevated @click="browseFolder" />
              <q-btn color="primary" icon="add" label="Add" unelevated @click="addRoot" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- UI Preferences -->
      <div class="col-12 col-md-5">
        <q-card bordered flat class="bg-grey-9 rounded-borders">
          <q-card-section class="bg-grey-10 text-grey-3">
            <div class="text-h6">Preferences</div>
            <div class="text-caption text-grey-6">General app behavior</div>
          </q-card-section>
          
          <q-card-section class="q-gutter-sm">
            <q-item tag="label" v-ripple class="bg-grey-10 rounded-borders q-mb-sm">
              <q-item-section>
                <q-item-label class="text-grey-3">Dark Mode</q-item-label>
                <q-item-label caption class="text-grey-6">Deep space aesthetic</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settingsStore.settings.darkMode" color="primary" @update:model-value="saveSettings" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple class="bg-grey-10 rounded-borders">
              <q-item-section>
                <q-item-label class="text-grey-3">Auto-check Ports</q-item-label>
                <q-item-label caption class="text-grey-6">Background network monitoring</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="settingsStore.settings.autoCheckPorts" color="secondary" @update:model-value="saveSettings" />
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const settingsStore = useSettingsStore()
const newRoot = ref('')

const isElectron = computed(() => typeof window !== 'undefined' && !!window.electronApi)

const addRoot = () => {
  if (!newRoot.value) return
  if (!settingsStore.settings.scanRoots) settingsStore.settings.scanRoots = []
  if (!settingsStore.settings.scanRoots.includes(newRoot.value)) {
    settingsStore.settings.scanRoots.push(newRoot.value)
    saveSettings()
  }
  newRoot.value = ''
}

const browseFolder = async () => {
  if (typeof window !== 'undefined' && window.electronApi) {
    const path = await window.electronApi.selectFolder()
    if (path) {
      newRoot.value = path
      addRoot()
    }
  }
}

const removeRoot = (root: string) => {
  settingsStore.settings.scanRoots = settingsStore.settings.scanRoots.filter(r => r !== root)
  saveSettings()
}

const saveSettings = () => {
  void settingsStore.saveSettings()
  $q.notify({
    message: 'Settings synchronized',
    color: 'positive',
    icon: 'cloud_done',
    position: 'bottom-right',
    timeout: 1000
  })
}

onMounted(() => {
  void settingsStore.loadSettings()
})
</script>

<style lang="sass" scoped>
.rounded-borders
  border-radius: 12px
</style>
