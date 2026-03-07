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
import { useSettingsStore } from './stores/settingsStore';
import { useI18n } from 'vue-i18n';

const settingsStore = useSettingsStore();
const { locale } = useI18n();
const isReady = ref(false);

// Ensure i18n locale stays in sync with settings store globally
watch(() => settingsStore.settings.locale, (val) => {
  if (val) locale.value = val;
}, { immediate: true });

onMounted(async () => {
  try {
    // init() now setups the reactive watch for dark mode and loads settings
    await settingsStore.init();
  } finally {
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
