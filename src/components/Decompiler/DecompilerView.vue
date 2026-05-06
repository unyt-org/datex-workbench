<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { createHighlighter, type Highlighter } from 'shiki'
import { useColorMode } from '@vueuse/core'
import datexGrammar from './datex.tmLanguage.json'

const mode = useColorMode()

const placeholderCode = `const example = [1,2,3,"test"];
const sharedValue = shared 42;

function myFunction() (
    @example :: print "Hello DATEX";
)

myFunction();
`

const highlightedHtml = ref('')
let highlighter: Highlighter | null = null

async function highlight() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [datexGrammar as never],
    })
  }
  const theme = mode.value === 'dark' ? 'github-dark' : 'github-light'
  highlightedHtml.value = highlighter.codeToHtml(placeholderCode, {
    lang: 'datex',
    theme,
  })
}

onMounted(highlight)
watch(() => mode.value, highlight)
</script>

<template>
  <div class="p-4 overflow-auto text-sm" v-html="highlightedHtml" />
</template>

<style scoped>
:deep(pre) {
  background: transparent !important;
  margin: 0;
  padding: 0;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}
</style>