<script setup lang="ts">
import NodeView from '@/components/NodeTree/Node.vue'
import EdgeView from '@/components/NodeTree/Edge.vue'
import { ref, type Ref, watch, nextTick, onMounted, computed } from 'vue'
import type { NodeTree, Position, Edge } from '@/types/NodeTree/node-tree'
import type { NodeTreeInput } from '@/types/NodeTree/node-tree-input'
import { parseNodeTree } from '@/composable/NodeTree/parseNodeTree'
import exampleJson from '@/../test/composable/NodeTree/fixtures/validExampleShort.json'
import dagre from 'dagre'


const example = exampleJson as NodeTreeInput
const tree: Ref<NodeTree<unknown, unknown>> = ref(parseNodeTree(example))

const canvasRef = ref<HTMLElement | null>(null)

// Reactive edge coordinates - recalculated when nodes move
const edgeCoords = ref<Map<string, { x1: number; y1: number; x2: number; y2: number }>>(new Map())

// Canvas panning
const isPanning = ref(false)
const panOffset = ref<Position>({ x: 0, y: 0 })
const panStart = ref<Position>({ x: 0, y: 0 })

const NODE_WIDTH = 224  // w-56

const scale = ref(1)


async function recalculateEdges() {
  await nextTick()
  const map = new Map<string, { x1: number; y1: number; x2: number; y2: number }>()

  for (const edge of tree.value.edges) {
    if (edge.source.kind === 'field' && edge.target.kind === 'field') {
     // All possible sides for source
     const srcEl =
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-out"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-top"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-bottom"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-in"]`)

      // All possible sides for target
      const tgtEl =
        canvasRef.value?.querySelector(`[data-field-id="${edge.target.fieldId}-in"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.target.fieldId}-top"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.target.fieldId}-bottom"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.target.fieldId}-out"]`)

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

  // Check maxConnections on source field
  if (sourceField.connectors?.length) {
    const maxConnections = sourceField.connectors[0]?.maxConnections
    if (maxConnections !== undefined) {
      const existingCount = tree.value.edges.filter(e =>
        e.source.kind === 'field' && e.source.fieldId === pendingEdge.value!.sourceFieldId
      ).length
      if (existingCount >= maxConnections) {
        console.warn('[NodeTree] Max connections reached for source field')
        pendingEdge.value = null
        return
      }
    }
  }

  // Check maxConnections on target field
  if (targetField.connectors?.length) {
    const maxConnections = targetField.connectors[0]?.maxConnections
    if (maxConnections !== undefined) {
      const existingCount = tree.value.edges.filter(e =>
        e.target.kind === 'field' && e.target.fieldId === targetFieldId
      ).length
      if (existingCount >= maxConnections) {
        console.warn('[NodeTree] Max connections reached for target field')
        pendingEdge.value = null
        return
      }
    }
  }

   // Source must be 'out' and target must be 'in'
  const sourceHasCustomConnectors = sourceField.connectors && sourceField.connectors.length > 0
  const targetHasCustomConnectors = targetField.connectors && targetField.connectors.length > 0

  if (!sourceHasCustomConnectors && !targetHasCustomConnectors) {
    if (!sourceField.out || !targetField.in) {
      console.warn('[NodeTree] Invalid connection: source must be out, target must be in')
      pendingEdge.value = null
      return
    }
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

// Dragged node edges on top
const draggedNodeEdges = computed(() => {
  if (!currentNodeId.value) return []
  return tree.value.edges.filter(e =>
    (e.source.kind === 'field' && e.source.nodeId === currentNodeId.value) ||
    (e.target.kind === 'field' && e.target.nodeId === currentNodeId.value) ||
    (e.source.kind === 'node' && e.source.nodeId === currentNodeId.value) ||
    (e.target.kind === 'node' && e.target.nodeId === currentNodeId.value)
  )
})

const otherEdges = computed(() => {
  if (!currentNodeId.value) return tree.value.edges
  return tree.value.edges.filter(e => !draggedNodeEdges.value.includes(e))
})

// Node dragging
const isDraggingNode = ref(false)
const currentNodeId = ref<string | null>(null)
const startPos = ref<Position>({ x: 0, y: 0 })


  function getNodeHeight(node: { fields: { length: number } }): number {
  const headerHeight = 52
  const rowHeight = 24
  return headerHeight + (node.fields.length * rowHeight) + 16
}

function resolveCollisions() {
  const padding = 20
  const len = tree.value.nodes.length

  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const nodeA = tree.value.nodes[i]
      const nodeB = tree.value.nodes[j]
      if (!nodeA || !nodeB) continue

      const aHeight = getNodeHeight(nodeA)
      const bHeight = getNodeHeight(nodeB)

      const overlapX = NODE_WIDTH + padding - Math.abs(nodeA.position.x - nodeB.position.x)
      const overlapY = (aHeight + bHeight) / 2 + padding - Math.abs(nodeA.position.y - nodeB.position.y)

      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          const push = overlapX / 2
          if (nodeA.position.x < nodeB.position.x) {
            nodeA.position.x -= push
            nodeB.position.x += push
          } else {
            nodeA.position.x += push
            nodeB.position.x -= push
          }
        } else {
          const push = overlapY / 2
          if (nodeA.position.y < nodeB.position.y) {
            nodeA.position.y -= push
            nodeB.position.y += push
          } else {
            nodeA.position.y += push
            nodeB.position.y -= push
          }
        }
      }
    }
  }
}


function mouseDownNode(event: MouseEvent, nodeId: string) {
  // Don't drag if clicking on text content
  const target = event.target as HTMLElement
  if (target.classList.contains('node-field-text')) return

  isDraggingNode.value = true
  currentNodeId.value = nodeId
  const node = tree.value.nodes.find((n) => n.id === nodeId)
  if (!node) return
  startPos.value = {
    x: event.clientX - node.position.x,
    y: event.clientY - node.position.y,
  }
  event.preventDefault()
}

function mouseDownCanvas(event: MouseEvent) {
  if (isDraggingNode.value) return
  const target = event.target as HTMLElement
  if (target.closest('.node-card')) return
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
  if (isDraggingNode.value) {
    resolveCollisions()
  }
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

function centerNodes() {
  if (tree.value.nodes.length === 0) return

  // Find bounding box of all nodes
  const minX = Math.min(...tree.value.nodes.map(n => n.position.x))
  const minY = Math.min(...tree.value.nodes.map(n => n.position.y))
  const maxX = Math.max(...tree.value.nodes.map(n => n.position.x + NODE_WIDTH))
  const maxY = Math.max(...tree.value.nodes.map(n => n.position.y + getNodeHeight(n)))

  // Center of all nodes
  const contentWidth = maxX - minX
  const contentHeight = maxY - minY

  // Get viewport size
  const viewport = document.querySelector('.node-canvas') as HTMLElement
  if (!viewport) return
  const viewportWidth = viewport.clientWidth
  const viewportHeight = viewport.clientHeight

  // Calculate pan offset to center content
  panOffset.value = {
    x: (viewportWidth - contentWidth * scale.value) / 2 - minX * scale.value,
    y: (viewportHeight - contentHeight * scale.value) / 2 - minY * scale.value,
  }
}

function autoLayout() {
  const g = new dagre.graphlib.Graph()

  g.setGraph({
    rankdir: 'LR', // left to right
    nodesep: 40,   // gap between nodes
    ranksep: 80,   // gap between ranks
    marginx: 20,
    marginy: 20,
  })

  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes
  for (const node of tree.value.nodes) {
    g.setNode(node.id, {
      width: NODE_WIDTH,
      height: getNodeHeight(node),
    })
  }

  // Add edges
  for (const edge of tree.value.edges) {
    if (edge.source.kind === 'field' && edge.target.kind === 'field') {
      g.setEdge(edge.source.nodeId, edge.target.nodeId)
    } else if (edge.source.kind === 'node' && edge.target.kind === 'node') {
      g.setEdge(edge.source.nodeId, edge.target.nodeId)
    }
  }

  dagre.layout(g)

  // Apply positions back to nodes
  for (const node of tree.value.nodes) {
    const pos = g.node(node.id)
    if (pos) {
      node.position.x = pos.x - NODE_WIDTH / 2
      node.position.y = pos.y - getNodeHeight(node) / 2
    }
  }

  // Center after layout
  centerNodes()
}

function exportTree() {
  const json = JSON.stringify(tree.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'node-tree.json'
  a.click()
  URL.revokeObjectURL(url)
}

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInputRef.value?.click()
}

function importTree(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target?.result as string)
      tree.value = parseNodeTree(json)
    } catch (err) {
      console.error('[NodeTree] Invalid JSON file', err)
    }
  }
  reader.readAsText(file)
}

</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 node-canvas"
    :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @mouseleave="mouseUp"
    @mousedown="mouseDownCanvas"
    @wheel.prevent="onWheel"
  >

  <!-- Hidden file input -->
<input
  ref="fileInputRef"
  type="file"
  accept=".json"
  class="hidden"
  @change="importTree"
/>

  <!-- Buttons top right -->
<div class="absolute top-3 right-3 z-50 flex gap-2">

  <!-- Import button -->
  <button
    class="p-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300"
    title="Import from JSON"
    @click.stop="triggerImport"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  </button>

  <!-- Export button -->
  <button
    class="p-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300"
    title="Export to JSON"
    @click.stop="exportTree"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  </button>

  <!-- Auto layout button -->
  <button
    class="p-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300"
    title="Auto layout nodes"
    @click.stop="autoLayout"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1"/>
      <rect x="16" y="3" width="5" height="5" rx="1"/>
      <rect x="3" y="16" width="5" height="5" rx="1"/>
      <rect x="16" y="16" width="5" height="5" rx="1"/>
      <line x1="8" y1="5.5" x2="16" y2="5.5"/>
      <line x1="8" y1="18.5" x2="16" y2="18.5"/>
      <line x1="5.5" y1="8" x2="5.5" y2="16"/>
      <line x1="18.5" y1="8" x2="18.5" y2="16"/>
    </svg>
  </button>

  <!-- Center button -->
  <button
  class="p-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300"
  title="Center all nodes"
  @click.stop="centerNodes"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
  </svg>
</button>
</div>
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
<svg
  class="absolute pointer-events-none"
  style="width: 3000px; height: 3000px; overflow: visible"
>
  <!-- Other edges -->
  <template v-for="edge in otherEdges" :key="edge.id">
    <g
      v-if="edgeCoords.get(edge.id)"
      class="pointer-events-auto cursor-pointer"
      @click="removeEdge(edge.id)"
    >
      <path :d="getPath(edgeCoords.get(edge.id)!)" fill="none" stroke="transparent" stroke-width="12"/>
      <EdgeView :edge="edge" v-bind="edgeCoords.get(edge.id)!"/>
    </g>
  </template>
  </svg>

      <!-- Nodes -->
      <NodeView
  v-for="node in tree.nodes"
  :key="node.id"
  :node="node"
  :is-dragging="currentNodeId === node.id"
  @field-click="handleFieldClick"
  @start-drag="(e: MouseEvent) => mouseDownNode(e, node.id)"
/>
    </div>

    <!-- Top SVG layer for dragged node edges (above nodes) -->
    <svg
      class="absolute inset-0 pointer-events-none"
      style="width: 100%; height: 100%; overflow: visible; z-index: 100"
    >
      <g :transform="`translate(${panOffset.x}, ${panOffset.y}) scale(${scale})`">
        <template v-for="edge in draggedNodeEdges" :key="edge.id + '-top'">
          <g
            v-if="edgeCoords.get(edge.id)"
            class="pointer-events-none"
          >
            <EdgeView :edge="edge" v-bind="edgeCoords.get(edge.id)!"/>
          </g>
        </template>
      </g>
      </svg>

  </div>
</template>