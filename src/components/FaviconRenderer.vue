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
