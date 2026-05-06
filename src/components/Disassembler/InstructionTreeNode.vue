<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    type InstructionTree,
    type InstructionParts,
    getInstructionParts,
} from '@/types/disassembler';
import InstructionLabel from './InstructionLabel.vue';
import { Plus, Minus } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        node: InstructionTree;
        showNested: boolean;
        depth?: number;
        isLast?: boolean;
        prefixParts?: boolean[];
        isInnerScope?: boolean;
        nestingLevel?: number;
    }>(),
    {
        depth: 0,
        isLast: true,
        prefixParts: () => [],
        isInnerScope: false,
        nestingLevel: 0,
    },
);

const parts = computed<InstructionParts>(() => getInstructionParts(props.node.instruction));

const children = computed(() => props.node.children ?? []);

const innerNode = computed<InstructionTree | null>(() => {
    if (!props.showNested) return null;
    const inner = parts.value.inner;
    if (inner !== null && typeof inner === 'object' && !Array.isArray(inner)) {
        return inner as InstructionTree;
    }
    return null;
});

const hasExpandableContent = computed(() => children.value.length > 0 || innerNode.value !== null);
const bgStyle = computed(() => {
    if (props.nestingLevel === 0) return {};
    return { backgroundColor: `rgba(128, 128, 128, ${props.nestingLevel * 0.08})` };
});

const isOpen = ref(true);

function toggle() {
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <!-- ── Expandable node ── -->
    <div v-if="hasExpandableContent">
        <div class="tree-row cursor-pointer" :style="bgStyle" @click="toggle">
            <!-- Ancestor vertical lines -->
            <span
                v-for="(isParentLast, idx) in prefixParts"
                :key="idx"
                class="tree-indent"
                :class="{ 'has-line': !isParentLast }"
            />

            <!-- Junction with expand icon -->
            <span v-if="depth > 0" class="tree-junction" :class="{ 'is-last': isLast }">
                <span class="expand-box">
                    <Minus v-if="isOpen" class="size-3" />
                    <Plus v-else class="size-3" />
                </span>
            </span>

            <!-- Root level expand (no junction) -->
            <span v-else class="tree-root-toggle">
                <span class="expand-box">
                    <Minus v-if="isOpen" class="size-2.5" />
                    <Plus v-else class="size-2.5" />
                </span>
            </span>

            <!-- Horizontal connector -->
            <span v-if="depth > 0" class="tree-hline" />

            <InstructionLabel :name="parts.name" :meta="parts.meta" />
        </div>

        <!-- Children (collapsible) -->
        <div v-show="isOpen">
            <InstructionTreeNode
                v-if="innerNode"
                :node="innerNode"
                :show-nested="showNested"
                :depth="depth"
                :prefix-parts="[...prefixParts, isLast]"
                :is-inner-scope="true"
                :nesting-level="nestingLevel + 1"
            />
            <InstructionTreeNode
                v-for="(child, i) in children"
                :key="i"
                :node="child"
                :show-nested="showNested"
                :depth="isInnerScope ? depth + 2 : depth + 1"
                :is-last="i === children.length - 1"
                :prefix-parts="[...prefixParts, isLast]"
                :nesting-level="nestingLevel"
            />
        </div>
    </div>

    <!-- ── Leaf node ── -->
    <div v-else class="tree-row" :style="bgStyle">
        <span
            v-for="(isParentLast, idx) in prefixParts"
            :key="idx"
            class="tree-indent"
            :class="{ 'has-line': !isParentLast }"
        />
        <span v-if="depth > 0" class="tree-junction leaf" :class="{ 'is-last': isLast }" />
        <InstructionLabel :name="parts.name" :meta="parts.meta" />
    </div>
</template>

<style scoped>
/* ── Row layout ── */
.tree-row {
    display: flex;
    align-items: center;
    min-height: 24px;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.875rem;
}

/* ── Indent column (ancestor vertical lines) ── */
.tree-indent {
    width: 20px;
    min-height: 24px;
    position: relative;
    flex-shrink: 0;
}

.tree-indent.has-line::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #4b5563;
}

/* ── Junction column (vertical line + optional expand box) ── */
.tree-junction {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    min-height: 24px;
    position: relative;
    flex-shrink: 0;
}

/* Vertical line through the junction */
.tree-junction::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #4b5563;
}

/* Last child: line goes from top to center only */
.tree-junction.is-last::before {
    bottom: 50%;
}
/* Leaf junction — no expand box, just line */
.tree-junction.leaf {
    pointer-events: none;
}

.tree-junction.leaf::after {
    content: '';
    position: absolute;
    left: 10px;
    top: 50%;
    right: 0;
    height: 1px;
    background: #4b5563;
}

/* ── Root toggle (no junction line) ── */
.tree-root-toggle {
    display: inline-flex;
    align-items: center;
    margin-right: 4px;
    flex-shrink: 0;
}

/* ── Horizontal connector ── */
.tree-hline {
    width: 8px;
    height: 1px;
    background: #4b5563;
    flex-shrink: 0;
    margin-left: -1px;
    margin-right: 4px;
}

/* ── Expand/Collapse box ── */
.expand-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 1px solid #4b5563;
    border-radius: 2px;
    color: #9ca3af;
    background: var(--background, #0f1117);
    position: relative;
    z-index: 2;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
}

.expand-box:hover {
    border-color: #9ca3af;
    color: #d1d5db;
}
</style>

<script lang="ts">
export default { name: 'InstructionTreeNode' };
</script>
