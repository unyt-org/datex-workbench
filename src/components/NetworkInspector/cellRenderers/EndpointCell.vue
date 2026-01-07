<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';

interface Props {
    params: ICellRendererParams & { searchTerms?: string[] };
}

const props = defineProps<Props>();
const text = props.params.value as string;
const searchTerms = props.params.searchTerms || [];
</script>

<template>
    <TooltipWrapper v-if="text" :tooltip="text">
        <div class="max-w-64 cursor-default truncate text-blue-400">
            <HighlightedText :text="text" :searchTerms="searchTerms" />
        </div>
    </TooltipWrapper>
</template>
