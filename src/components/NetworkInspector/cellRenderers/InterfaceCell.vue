<script setup lang="ts">
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';

const props = defineProps<{
  value: string
  searchTerms?: string[]
}>()
</script>

<template>
    <HighlightedText
        v-if="props.value"
        :text="props.value"
        :searchTerms="props.searchTerms ?? []"
        class="text-muted-foreground"
    />
</template>
