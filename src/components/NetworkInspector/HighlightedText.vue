<script setup lang="ts">
import { computed } from 'vue';
import { highlightMatches } from '@/utils/searchParser';

interface HighlightedTextProps {
    text: string;
    searchTerms: string[];
    class?: string;
}

const props = withDefaults(defineProps<HighlightedTextProps>(), {
    class: '',
});

const highlightedHtml = computed(() => {
    return highlightMatches(props.text, props.searchTerms);
});
</script>

<template>
    <span :class="props.class" v-html="highlightedHtml"></span>
</template>
