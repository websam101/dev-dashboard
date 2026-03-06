<template>
  <div v-if="isReady">
    <router-view />
  </div>
  <!-- Minimal skeleton to avoid blank screen during load -->
  <div v-else class="loading-screen flex flex-center">
    <q-spinner-grid color="primary" size="4em" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Dark } from 'quasar';
import { useSettingsStore } from './stores/settingsStore';

const settingsStore = useSettingsStore();
const isReady = ref(false);

// Apply dark mode whenever it changes in the store
watch(() => settingsStore.settings.darkMode, (isDark) => {
  Dark.set(isDark);
}, { immediate: true });

onMounted(async () => {
  try {
    // 1. Load settings from IDB (Async)
    await settingsStore.loadSettings();
    // 2. Apply theme immediately after load
    Dark.set(settingsStore.settings.darkMode);
  } finally {
    // 3. Signal that UI is ready for hydration
    isReady.value = true;
  }
});
</script>

<style lang="sass">
.loading-screen
  height: 100vh
  width: 100vw
  background: #121212 // Default dark background for initial load
</style>
