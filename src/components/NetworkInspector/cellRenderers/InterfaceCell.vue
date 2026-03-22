<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';

interface Props {
    params: ICellRendererParams & { searchTerms?: string[] };
}

const props = defineProps<Props>();
const value = props.params.value as string;
const searchTerms = props.params.searchTerms || [];
</script>

<template>
    <HighlightedText
        v-if="value"
        :text="value"
        :searchTerms="searchTerms"
        class="text-muted-foreground"
    />
</template>
