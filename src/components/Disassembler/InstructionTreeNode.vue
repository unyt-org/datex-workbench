<script setup lang="ts">
import { computed } from 'vue'
import {
  type InstructionTree,
  type InstructionParts,
  getInstructionParts,
} from '@/types/disassembler'
import InstructionLabel from './InstructionLabel.vue'

const props = withDefaults(
  defineProps<{
    node: InstructionTree
    showNested: boolean
    depth?: number
    isLast?: boolean
    prefixParts?: boolean[]
    /** When true, renders with ↳ marker instead of tree connector */
    isInnerScope?: boolean
  }>(),
  {
    depth: 0,
    isLast: true,
    prefixParts: () => [],
    isInnerScope: false,
  }
)

const parts = computed<InstructionParts>(() => getInstructionParts(props.node.instruction))

const prefix = computed(() =>
  props.prefixParts.map((isParentLast) => (isParentLast ? '   ' : '│  ')).join('')
)

const connector = computed(() => {
  if (props.isInnerScope) return ''
  if (props.depth === 0) return ''
  return props.isLast ? '└─ ' : '├─ '
})

const children = computed(() => props.node.children ?? [])

const innerNode = computed<InstructionTree | null>(() => {
  if (!props.showNested) return null
  const inner = parts.value.inner
  if (inner !== null && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as InstructionTree
  }
  return null
})

const hasExpandableContent = computed(() =>
  children.value.length > 0 || innerNode.value !== null
)
</script>

<template>
  <!-- Node with children: collapsible -->
  <details v-if="hasExpandableContent" open class="tree-node">
    <summary class="tree-line">
  <span class="tree-prefix">{{ prefix }}{{ connector }}</span>
    <span v-if="isInnerScope" class="text-amber-400">↳</span>
    <InstructionLabel :name="parts.name" :meta="parts.meta" />
  </summary>

  <!-- Inner instruction scope (e.g. REMOTE_EXECUTION body) -->
  <InstructionTreeNode
    v-if="innerNode"
    :node="innerNode"
    :show-nested="showNested"
    :depth="depth"
    :prefix-parts="[...prefixParts, isLast]"
    :is-inner-scope="true"
  />

  <!-- Regular children -->
  <InstructionTreeNode
    v-for="(child, i) in children"
    :key="i"
    :node="child"
    :show-nested="showNested"
    :depth="(isInnerScope ? depth + 2 : depth + 1)"
    :is-last="i === children.length - 1"
    :prefix-parts="[...prefixParts, isLast]"
  />
</details>

<!-- Leaf node: no children, just a line -->
<div v-else class="tree-line">
    <span class="tree-prefix">{{ prefix }}{{ connector }}</span>
    <span v-if="isInnerScope" class="text-amber-400">↳ </span>
    <InstructionLabel :name="parts.name" :meta="parts.meta" />
  </div>

</template>

<style scoped>
.tree-node {
  margin: 0;
  padding: 0;
}

.tree-node > summary {
  list-style: none;
  cursor: pointer;
}

.tree-node > summary::-webkit-details-marker {
  display: none;
}

.tree-node > summary::marker {
  display: none;
  content: '';
}

.tree-line {
  white-space: pre;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.3;
  margin: 0;
  padding: 0;
}

.tree-prefix {
  color: #4b5563;
}
</style>

<script lang="ts">
export default { name: 'InstructionTreeNode' }
</script>