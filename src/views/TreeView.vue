<script setup lang="ts">
import NodeView from '@/components/NodeTree/Node.vue'
import EdgeView from '@/components/NodeTree/Edge.vue'
import { ref, type Ref, watch, nextTick, onMounted } from 'vue'
import type { NodeTree, Position, Edge } from '@/types/NodeTree/node-tree'
import type { NodeTreeInput } from '@/types/NodeTree/node-tree-input'
import { parseNodeTree } from '@/composable/NodeTree/parseNodeTree'
import exampleJson from '@/../test/composable/NodeTree/fixtures/validExampleShort.json'

const example = exampleJson as NodeTreeInput
const tree: Ref<NodeTree<unknown, unknown>> = ref(parseNodeTree(example))

const canvasRef = ref<HTMLElement | null>(null)

// Reactive edge coordinates - recalculated when nodes move
const edgeCoords = ref<Map<string, { x1: number; y1: number; x2: number; y2: number }>>(new Map())

async function recalculateEdges() {
  await nextTick()
  const map = new Map<string, { x1: number; y1: number; x2: number; y2: number }>()

  for (const edge of tree.value.edges) {
    if (edge.source.kind === 'field' && edge.target.kind === 'field') {
      const srcEl = canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-out"]`)
      const tgtEl = canvasRef.value?.querySelector(`[data-field-id="${edge.target.fieldId}-in"]`)

      if (srcEl && tgtEl && canvasRef.value) {
        const canvasRect = canvasRef.value.getBoundingClientRect()
        const srcRect = srcEl.getBoundingClientRect()
        const tgtRect = tgtEl.getBoundingClientRect()

        map.set(edge.id, {
          x1: (srcRect.left + srcRect.width / 2 - canvasRect.left) / scale.value,
          y1: (srcRect.top + srcRect.height / 2 - canvasRect.top) / scale.value,
          x2: (tgtRect.left + tgtRect.width / 2 - canvasRect.left) / scale.value,
          y2: (tgtRect.top + tgtRect.height / 2 - canvasRect.top) / scale.value,
        })
      }
    }
  }
  edgeCoords.value = map
}

// Watch node positions and edges for changes
watch(() => tree.value.nodes.map(n => ({ ...n.position })), recalculateEdges, { deep: true })
watch(() => tree.value.edges.length, recalculateEdges)

onMounted(() => {
  recalculateEdges()
})

const scale = ref(1)

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.min(Math.max(scale.value + delta, 0.2), 3)

  // Get cursor position relative to outer container
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // Adjust pan offset so zoom origin is at cursor
  const scaleRatio = newScale / scale.value
  panOffset.value = {
    x: mouseX - scaleRatio * (mouseX - panOffset.value.x),
    y: mouseY - scaleRatio * (mouseY - panOffset.value.y),
  }

  scale.value = newScale
}

function getPath(coords: { x1: number; y1: number; x2: number; y2: number }): string {
  const cx = (coords.x1 + coords.x2) / 2
  return `M ${coords.x1} ${coords.y1} C ${cx} ${coords.y1}, ${cx} ${coords.y2}, ${coords.x2} ${coords.y2}`
}

// Edge being created
const pendingEdge = ref<{ sourceFieldId: string; sourceNodeId: string; isOut: boolean } | null>(null)

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function startEdge(fieldId: string, nodeId: string, isOut: boolean) {
  pendingEdge.value = { sourceFieldId: fieldId, sourceNodeId: nodeId, isOut }
}

function completeEdge(targetFieldId: string, targetNodeId: string) {
  if (!pendingEdge.value) return

  // Prevent self-connection
  if (
    pendingEdge.value.sourceFieldId === targetFieldId &&
    pendingEdge.value.sourceNodeId === targetNodeId
  ) {
    pendingEdge.value = null
    return
  }

  // Find source and target fields
  const sourceNode = tree.value.nodes.find(n => n.id === pendingEdge.value!.sourceNodeId)
  const targetNode = tree.value.nodes.find(n => n.id === targetNodeId)
  const sourceField = sourceNode?.fields.find(f => f.id === pendingEdge.value!.sourceFieldId)
  const targetField = targetNode?.fields.find(f => f.id === targetFieldId)

  if (!sourceField || !targetField) {
    pendingEdge.value = null
    return
  }
   // Source must be 'out' and target must be 'in'
   if (!sourceField.out || !targetField.in) {
    console.warn('[NodeTree] Invalid connection: source must be out, target must be in')
    pendingEdge.value = null
    return
  }

  const newEdge: Edge = {
    id: generateId(),
    source: { kind: 'field', fieldId: pendingEdge.value.sourceFieldId, nodeId: pendingEdge.value.sourceNodeId },
    target: { kind: 'field', fieldId: targetFieldId, nodeId: targetNodeId },
    edgetype: 'websocket',
    direction: 'bidirectional',
    style: 'bezier',
  }

  tree.value.edges.push(newEdge)
  pendingEdge.value = null
}

function removeEdge(edgeId: string) {
  tree.value.edges = tree.value.edges.filter(e => e.id !== edgeId)
}

// Node dragging
const isDraggingNode = ref(false)
const currentNodeId = ref<string | null>(null)
const startPos = ref<Position>({ x: 0, y: 0 })

// Canvas panning
const isPanning = ref(false)
const panOffset = ref<Position>({ x: 0, y: 0 })
const panStart = ref<Position>({ x: 0, y: 0 })


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

function handleFieldClick(fieldId: string, nodeId: string, isOut: boolean) {
  if (pendingEdge.value) {
    // Only complete if source was out and target is in
    if (pendingEdge.value.isOut && !isOut) {
      completeEdge(fieldId, nodeId)
    } else {
      // Invalid — reset
      pendingEdge.value = null
    }
  } else {
    startEdge(fieldId, nodeId, isOut)
  }
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
    ref="canvasRef"
  class="absolute origin-top-left"
  style="width: 3000px; height: 3000px"
  :style="{
    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`
  }"
>
      <!-- SVG layer for edges -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
  <template v-for="edge in tree.edges" :key="edge.id">
    <g
      v-if="edgeCoords.get(edge.id)"
      class="pointer-events-auto cursor-pointer group"
      @click="removeEdge(edge.id)"
    >
      <!-- Invisible thick path for easier clicking -->
      <path
        :d="getPath(edgeCoords.get(edge.id)!)"
        fill="none"
        stroke="transparent"
        stroke-width="12"
      />
      <EdgeView
        :edge="edge"
        v-bind="edgeCoords.get(edge.id)!"
      />
    </g>
  </template>
</svg>

      <!-- Nodes -->
      <NodeView
  v-for="node in tree.nodes"
  :key="node.id"
  :node="node"
  @mousedown.left.stop="(e: MouseEvent) => mouseDownNode(e, node.id)"
  @field-click="handleFieldClick"
/>
    </div>
  </div>
</template>