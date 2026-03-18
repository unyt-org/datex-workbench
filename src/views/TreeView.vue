<script setup lang="ts">
import NodeView from '@/components/NodeTree/Node.vue'
import EdgeView from '@/components/NodeTree/Edge.vue'
import { ref, type Ref, computed } from 'vue'
import type { NodeTree, Position } from '@/types/NodeTree/node-tree'
import type { NodeTreeInput } from '@/types/NodeTree/node-tree-input'
import { parseNodeTree } from '@/composable/NodeTree/parseNodeTree'
import exampleJson from '@/../test/composable/NodeTree/fixtures/validExampleShort.json'

const example = exampleJson as NodeTreeInput
const tree: Ref<NodeTree<unknown, unknown>> = ref(parseNodeTree(example))

  const edgeCoords = computed(() => {
  return tree.value.edges.map((edge) => ({
    edge,
    coords: getEdgeCoords(edge),
  }))
})

const scale = ref(1)

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.min(Math.max(scale.value + delta, 0.2), 3)
}

// Node dragging
const isDraggingNode = ref(false)
const currentNodeId = ref<string | null>(null)
const startPos = ref<Position>({ x: 0, y: 0 })

// Canvas panning
const isPanning = ref(false)
const panOffset = ref<Position>({ x: 0, y: 0 })
const panStart = ref<Position>({ x: 0, y: 0 })

  function getNodeFieldPosition(fieldId: string, side: 'in' | 'out'): Position | null {
  // Find which node has this field
  const node = tree.value.nodes.find(n => n.fields.some(f => f.id === fieldId))
  if (!node) return null

  const fieldIndex = node.fields.findIndex(f => f.id === fieldId)
  if (fieldIndex === -1) return null

  const nodeWidth = 224 // w-56 = 14rem = 224px
  const headerHeight = 52 // CardHeader height approx
  const rowHeight = 24 // each field row height approx
  const dotOffset = 6 // half dot size

  return {
    x: side === 'out' ? node.position.x + nodeWidth : node.position.x,
    y: node.position.y + headerHeight + (fieldIndex * rowHeight) + dotOffset,
  }
}

function getEdgeCoords(edge: NodeTree['edges'][0]) {
  if (edge.source.kind === 'field' && edge.target.kind === 'field') {
    const src = getNodeFieldPosition(edge.source.fieldId, 'out')
    const tgt = getNodeFieldPosition(edge.target.fieldId, 'in')
    if (src && tgt) return { x1: src.x, y1: src.y, x2: tgt.x, y2: tgt.y }
  }
  return null
}

function mouseDownNode(event: MouseEvent, nodeId: string) {
  isDraggingNode.value = true
  currentNodeId.value = nodeId
  const node = tree.value.nodes.find((n) => n.id === nodeId)
  if (!node) return
  startPos.value = {
    x: event.clientX - node.position.x,
    y: event.clientY - node.position.y,
  }
  event.preventDefault()
  event.stopPropagation()
}

function mouseDownCanvas(event: MouseEvent) {
  if (isDraggingNode.value) return
  isPanning.value = true
  panStart.value = {
    x: event.clientX - panOffset.value.x,
    y: event.clientY - panOffset.value.y,
  }
}

function mouseMove(event: MouseEvent) {
  if (isDraggingNode.value && currentNodeId.value) {
    const node = tree.value.nodes.find((n) => n.id === currentNodeId.value)
    if (node) {
      node.position = {
        x: event.clientX - startPos.value.x,
        y: event.clientY - startPos.value.y,
      }
    }
  } else if (isPanning.value) {
    panOffset.value = {
      x: event.clientX - panStart.value.x,
      y: event.clientY - panStart.value.y,
    }
  }
}

function mouseUp() {
  isDraggingNode.value = false
  currentNodeId.value = null
  isPanning.value = false
}
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950"
    :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @mouseleave="mouseUp"
    @mousedown="mouseDownCanvas"
    @wheel.prevent="onWheel"
  >
    <!-- Inner canvas -->
    <div
  class="absolute origin-top-left"
  style="width: 3000px; height: 3000px"
  :style="{
    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`
  }"
>
      <!-- SVG layer for edges -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <template v-for="{ edge, coords } in edgeCoords" :key="edge.id">
          <EdgeView
            v-if="coords"
            :edge="edge"
            v-bind="coords"
          />
        </template>
      </svg>

      <!-- Nodes -->
      <NodeView
        v-for="node in tree.nodes"
        :key="node.id"
        :node="node"
        @mousedown.left.stop="(e: MouseEvent) => mouseDownNode(e, node.id)"
      />
    </div>
  </div>
</template>