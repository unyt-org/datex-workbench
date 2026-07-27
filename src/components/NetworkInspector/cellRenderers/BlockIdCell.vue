<script setup lang="ts">
import type { BlockId } from '@/composable/useNetworkInspector';
const props = defineProps<{
    value: BlockId;
    searchTerms?: string[];
}>();
</script>

<template>
    <span>{{ props.value.contextId }}:{{ props.value.sectionIndex }}</span>
    <span class="text-muted-foreground">#{{ props.value.blockNumber }}</span>
</template>
