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
  <q-img
    v-if="faviconUrl"
    :src="faviconUrl"
    style="width: 16px; height: 16px; border-radius: 4px;"
    alt="Favicon"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const faviconUrl = ref('')

const domain = props.url.replace(/https?:\/\//, '').split('/')[0]
const faviconPath = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

onMounted(() => {
  try {
    faviconUrl.value = faviconPath
  } catch (e) {
    console.error('Failed to load favicon', e)
  }
})
</script>
