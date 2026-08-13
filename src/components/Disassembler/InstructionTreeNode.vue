<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    type InstructionParts,
    getInstructionParts,
} from '@/types/disassembler';
import type { Span, InstructionTree } from '@/lib/_temp_types.ts';
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
        stripParentsBeforeIndex?: number;
    }>(),
    {
        depth: 0,
        isLast: true,
        prefixParts: () => [],
        isInnerScope: false,
        nestingLevel: 0,
        stripParentsBeforeIndex: 0,
    },
);

const selectedBodySpan = defineModel<Span | null>();

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
    return { backgroundColor: `rgba(128, 128, 128, 0.08)`, borderRadius: '4px', paddingTop: '4px', paddingBottom: '4px' };
});

const isOpen = ref(true);

function toggle() {
    isOpen.value = !isOpen.value;
}

function focusSpan(span: Span|null) {
  selectedBodySpan.value = span;
}

</script>

<template>
    <!-- ── Expandable node ── -->
    <div class="root" v-if="hasExpandableContent" :style="isInnerScope && bgStyle">
        <div class="tree-row cursor-pointer" @click="toggle" @mouseenter="focusSpan(parts.span)" @mouseleave="focusSpan(null)">
            <!-- Ancestor vertical lines -->
            <span
                v-for="(isParentLast, idx) in prefixParts"
                :key="idx"
                class="tree-indent"
                :class="{ 'has-line': !isParentLast && idx >= stripParentsBeforeIndex }"
            />

            <!-- Junction with expand icon -->
            <span v-if="true" class="tree-junction" :class="{ 'expanded': isOpen, 'is-last': isLast, 'is-root': depth === 0 || isInnerScope }">
                <span class="expand-box">
                    <Minus v-if="isOpen" class="size-3" />
                    <Plus v-else class="size-3" />
                </span>
            </span>

            <!-- Horizontal connector -->
            <span v-if="true" class="tree-hline" :class="{ 'expanded': isOpen }" />
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
                :strip-parents-before-index="depth"
                :nesting-level="nestingLevel + 1"
                v-model="selectedBodySpan"
            />
            <InstructionTreeNode
                v-for="(child, i) in children"
                :key="i"
                :node="child"
                :show-nested="showNested"
                :depth="isInnerScope ? depth + 2 : depth + 1"
                :strip-parents-before-index="stripParentsBeforeIndex"
                :is-last="i === children.length - 1"
                :prefix-parts="[...prefixParts, isLast]"
                :nesting-level="nestingLevel"
                v-model="selectedBodySpan"
            />
        </div>
    </div>

    <!-- ── Leaf node ── -->
    <div v-else class="tree-row" @mouseenter="focusSpan(parts.span)" @mouseleave="focusSpan(null)">
        <span
            v-for="(isParentLast, idx) in prefixParts"
            :key="idx"
            class="tree-indent"
            :class="{ 'has-line': !isParentLast && idx >= stripParentsBeforeIndex }"
        ></span>
        <span v-if="depth > 0" class="tree-junction leaf" :class="{ 'is-last': isLast, 'is-root': depth === 0 || isInnerScope }" />
        <InstructionLabel :name="parts.name" :meta="parts.meta" />
    </div>
</template>

<style scoped>
/* ── Row layout ── */
.tree-row {
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: flex-start;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.875rem;
}

.tree-row:hover {
    background-color: rgba(100, 100, 100, 0.2);
}


/* ── Indent column (ancestor vertical lines) ── */
.tree-indent {
    width: 18px;
    position: relative;
    flex-shrink: 0;
}

.tree-indent.has-line {
    height: -webkit-fill-available;
}

.tree-indent.has-line::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #4b5563;
}

/* ── Junction column (vertical line + optional expand box) ── */
.tree-junction {
    width: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
}

/* Vertical line through the junction */
.tree-junction:not(.is-root)::after {
    content: '';
    position: absolute;
    left: 9px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #4b5563;
    height: 10px;
}

/* horizontal stub */
.tree-junction::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 10px;
    right: 0;
    height: 1px;
    background: #4b5563;
}

.tree-junction:not(.is-root):not(.is-last)::after {
    height: 25px;
}

/* Leaf junction — no expand box, just line */
.tree-junction.leaf {
    width: 34px;
    pointer-events: none;
}

.tree-junction.leaf::after {
    content: '';
    position: absolute;
    left: 9px;
    bottom: 10px;
    right: 0;
    height: 10px;
    background: #4b5563;
}

/* ── Horizontal connector ── */
.tree-hline {
    height: -webkit-fill-available;
    width: 18px;
    flex-shrink: 0;
    position: relative;
}

/** down connector */
.tree-hline.expanded::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 9px;
    height: 100%;
    width: 1px;
    background: #4b5563;
}
/** down connector */
.tree-hline:not(.expanded)::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 9px;
    height: 5px;
    width: 1px;
    background: #4b5563;
}

/** horizontal line */
.tree-hline::before {
    content: '';
    width: 100%;
    height: 1px;
    background: #4b5563;
    position: absolute;
    top: 10px;
}



/* ── Expand/Collapse box ── */
.expand-box {
    margin-top: 2px;
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
