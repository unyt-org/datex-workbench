<script setup lang="ts">
import { computed, ref } from 'vue'
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
    nestingLevel?: number
  }>(),
  {
    depth: 0,
    isLast: true,
    prefixParts: () => [],
    isInnerScope: false,
    nestingLevel: 0
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
const bgStyle = computed(() => {
  if (!props.isInnerScope) return {}
  return { backgroundColor: `rgba(128, 128, 128, ${props.nestingLevel * 0.08})` }
})

const isOpen = ref(true)

function handleToggle(event: Event) {
  isOpen.value = (event.target as HTMLDetailsElement).open
}
</script>

<template>
  <!-- Node with children: collapsible -->
  <details v-if="hasExpandableContent" open class="tree-node" :style="bgStyle" @toggle="handleToggle">
    <summary class="tree-line">
      <span class="tree-prefix">{{ prefix }}</span>
      <span class="expand-icon">{{ isOpen ? '[-]' : '[+]' }}</span>
      <span class="tree-prefix">- </span>
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
    :nesting-level="nestingLevel + 1"
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
    :nesting-level="nestingLevel"
  />
</details>

<!-- Leaf node: no children, just a line -->
<div v-else class="tree-line" :style="bgStyle">
  <span class="tree-prefix">{{ prefix }}{{ connector }}</span>
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

.expand-icon {
  display: inline-block;
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  margin: 0 1px;
}

</style>

<script lang="ts">
export default { name: 'InstructionTreeNode' }
</script>