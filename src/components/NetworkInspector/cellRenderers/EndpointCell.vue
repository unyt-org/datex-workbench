<script setup lang="ts">
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';

const props = defineProps<{
  value: string
  searchTerms?: string[]
}>()
</script>

<template>
    <TooltipWrapper v-if="props.value" :tooltip="props.value">
        <div class="max-w-64 cursor-default truncate text-blue-400">
            <HighlightedText :text="props.value" :searchTerms="props.searchTerms ?? []" />
        </div>
    </TooltipWrapper>
    <div v-else class="text-muted-foreground italic">null</div>
</template>
