<script setup lang="ts">
import { computed } from 'vue';
import {
    type FlatInstruction,
    type Instruction,
    type InstructionParts,
    getInstructionParts,
} from '@/types/disassembler';
import InstructionLabel from './InstructionLabel.vue';

const props = withDefaults(
    defineProps<{
        instruction: FlatInstruction;
        showNested: boolean;
        indentLevel?: number;
    }>(),
    { indentLevel: 0 },
);

const parts = computed<InstructionParts>(() => getInstructionParts(props.instruction));

const indent = computed(() => '  '.repeat(props.indentLevel));

/** Inner instruction list (3rd element for FlatInstruction is Instruction[]) */
const innerInstructions = computed<FlatInstruction[]>(() => {
    if (!props.showNested) return [];
    const inner = parts.value.inner;
    if (Array.isArray(inner)) return inner as Instruction[];
    return [];
});

const hasExpandableContent = computed(() => innerInstructions.value.length > 0);

const bgStyle = computed(() => {
    if (props.indentLevel === 0) return {};
    return { backgroundColor: `rgba(128, 128, 128, ${props.indentLevel * 0.08})` };
});
</script>

<template>
    <!-- Node with inner instructions: collapsible -->
    <details v-if="hasExpandableContent" open class="flat-node" :style="bgStyle">
        <summary class="flat-line">
            <span class="flat-prefix">{{ indent }}</span>
            <InstructionLabel :name="parts.name" :meta="parts.meta" />
        </summary>

        <InstructionFlatItem
            v-for="(nested, i) in innerInstructions"
            :key="i"
            :instruction="nested as FlatInstruction"
            :show-nested="showNested"
            :indent-level="indentLevel + 1"
        />
    </details>

    <!-- Leaf instruction: just a line -->
    <div v-else class="flat-line" :style="bgStyle">
        <span class="flat-prefix">{{ indent }}</span>
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
}

.flat-prefix {
    color: #4b5563;
}
</style>

<script lang="ts">
export default { name: 'InstructionFlatItem' };
</script>
