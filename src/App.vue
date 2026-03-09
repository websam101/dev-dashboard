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
