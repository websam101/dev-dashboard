<template>
  <div class="formatted-text">
    <template v-for="(part, index) in parsedParts" :key="index">
      <a
        v-if="part.isUrl"
        :href="part.text"
        target="_blank"
        class="custom-link"
        @click.stop
      >{{ part.text }}</a>
      <span v-else>{{ part.text }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ''
  }
});

const parsedParts = computed(() => {
  if (!props.text) return [];

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = props.text.split(urlRegex);
  const matches: string[] = props.text.match(urlRegex) || [];
  
  const result = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (matches.includes(part)) {
      result.push({ text: part, isUrl: true });
    } else if (part) {
      result.push({ text: part, isUrl: false });
    }
  }

  return result;
});
</script>

<style lang="sass" scoped>
.formatted-text
  white-space: pre-wrap
  word-break: break-word
  line-height: 1.6

.custom-link
  color: var(--dd-link)
  text-decoration: underline
  text-decoration-thickness: 2px
  text-underline-offset: 2px
  font-weight: 700
  transition: all 0.2s ease
  &:hover
    color: var(--dd-link-hover)
    background: var(--dd-primary-glow)
    border-radius: 4px
</style>
