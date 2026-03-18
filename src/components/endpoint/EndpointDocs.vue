<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

interface Props {
  markdown?: string
}

const props = defineProps<Props>()

const md = new MarkdownIt({
  html: false,      
  linkify: true,
  typographer: true
})

const renderedHtml = computed(() => {
    if (!props.markdown) return ''
  return md.render(props.markdown)
})
</script>

<template>
  <div class="prose prose-sm dark:prose-invert max-w-none">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="renderedHtml" />
  </div>
</template>