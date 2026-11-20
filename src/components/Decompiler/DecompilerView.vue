<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useShikiHighlighter } from '../../composable/useShikiHighlighter';
import { useColorMode } from '@vueuse/core';

const mode = useColorMode();

const props = defineProps<{
    code: string;
}>();

const highlightedHtml = ref('');
const highlighter = await useShikiHighlighter();

async function highlight() {
    const theme = mode.value === 'dark' ? 'DATEX Dark' : 'DATEX Light';
    highlightedHtml.value = highlighter.codeToHtml(props.code, {
        lang: 'datex',
        theme,
    });
}

onMounted(highlight);
watch(() => mode.value, highlight);
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
