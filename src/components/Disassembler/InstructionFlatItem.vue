<script setup lang="ts">
import { computed } from 'vue';
import {
    type InstructionParts,
    getInstructionParts,
} from '@/types/disassembler';
import type { FlatInstruction, Span } from '@/lib/_temp_types.ts';
import InstructionLabel from './InstructionLabel.vue';

const props = withDefaults(
    defineProps<{
        instruction: FlatInstruction;
        showNested: boolean;
        indentLevel?: number;
    }>(),
    { indentLevel: 1 },
);

const selectedBodySpan = defineModel<Span | null>();

const parts = computed<InstructionParts>(() => getInstructionParts(props.instruction));

/** Inner instruction list (3rd element for FlatInstruction is Instruction[]) */
const innerInstructions = computed<FlatInstruction[]>(() => {
    if (!props.showNested) return [];
    const inner = parts.value.inner;
    if (Array.isArray(inner)) return inner as FlatInstruction[];
    return [];
});

const hasExpandableContent = computed(() => innerInstructions.value.length > 0);

const bgStyle = computed(() => {
    if (props.indentLevel === 0) return {};
    return { backgroundColor: `rgba(128, 128, 128, 0.08)`, borderRadius: '4px', padding: '4px' };
});

function focusSpan(span: Span|null) {
  selectedBodySpan.value = span;
}
</script>

<template>
    <!-- Node with inner instructions: collapsible -->
    <details v-if="hasExpandableContent" open class="flat-node" @mouseenter="focusSpan(parts.span)" @mouseleave="focusSpan(null)">
        <summary class="flat-line">
            <InstructionLabel :name="parts.name" :meta="parts.meta" />
        </summary>

        <div :style="bgStyle">
          <InstructionFlatItem
            v-for="(nested, i) in innerInstructions"
            :key="i"
            :instruction="nested as FlatInstruction"
            :show-nested="showNested"
            :indent-level="indentLevel + 1"
        />
        </div>
    </details>

    <!-- Leaf instruction: just a line -->
    <div v-else class="flat-line" @mouseenter="focusSpan(parts.span)" @mouseleave="focusSpan(null)">
        <InstructionLabel :name="parts.name" :meta="parts.meta" />
    </div>
</template>

<style scoped>
.flat-node {
    margin: 0;
    padding: 0;
}

.flat-node > summary {
    list-style: none;
    cursor: pointer;
}

.flat-node > summary::-webkit-details-marker {
    display: none;
}

.flat-node > summary::marker {
    display: none;
    content: '';
}

.flat-line {
    white-space: pre;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    display: flex;
}

.flat-line:hover {
    background-color: rgba(100, 100, 100, 0.2);
}

.flat-prefix {
    color: #4b5563;
}
</style>

<script lang="ts">
export default { name: 'InstructionFlatItem' };
</script>
