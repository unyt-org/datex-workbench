<script setup lang="ts">
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';
import { Datex } from '@/lib/runtime';
import type { Builtins } from '@unyt/datex';
import { computed } from 'vue';

const props = defineProps<{
    value: Builtins.Endpoint | null;
    searchTerms?: string[];
}>();

const isLocal = computed(
    () => props.value == Datex.endpoint || props.value?.toString() === '@@local',
);
</script>

<template>
    <TooltipWrapper
        v-if="props.value"
        :tooltip="props.value.toString() + (isLocal ? ' (local endpoint)' : '')"
    >
        <div class="max-w-64 cursor-default truncate" :class="isLocal ? '' : 'text-blue-400'">
            <HighlightedText
                :text="props.value.toString()"
                :searchTerms="props.searchTerms ?? []"
            />
        </div>
    </TooltipWrapper>
    <div v-else class="text-muted-foreground italic">-</div>
</template>
