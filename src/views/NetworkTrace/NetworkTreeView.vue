<script setup lang="ts">
import NodeView from '@/components/NodeTree/Node.vue'
import EdgeView from '@/components/NodeTree/Edge.vue'
import { ref, type Ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import type { NodeTree, Position, Edge } from '@/types/NodeTree/node-tree'
import dagre from 'dagre'

const props = defineProps<{
  tree: NodeTree
}>()

const tree: Ref<NodeTree> = ref(props.tree)

watch(() => props.tree, (newTree) => {
  tree.value = newTree
}, { deep: true })

const isReadOnly = ref(false)
const canvasRef = ref<HTMLElement | null>(null)

type BackgroundPattern = 'none' | 'grid' | 'checkerboard'
const backgroundPattern = ref<BackgroundPattern>('grid')

const edgeCoords = ref<Map<string, { x1: number; y1: number; x2: number; y2: number }>>(new Map())

const isPanning = ref(false)
const panOffset = ref<Position>({ x: 0, y: 0 })
const panStart = ref<Position>({ x: 0, y: 0 })

const NODE_WIDTH = 224
const scale = ref(1)

async function recalculateEdges() {
  await nextTick()
  const map = new Map<string, { x1: number; y1: number; x2: number; y2: number }>()

  for (const edge of tree.value.edges) {
    if (edge.source.kind === 'field' && edge.target.kind === 'field') {
      const srcEl =
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-out"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-top"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-bottom"]`) ??
        canvasRef.value?.querySelector(`[data-field-id="${edge.source.fieldId}-in"]`)

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

watch(() => tree.value.nodes.map(n => ({ ...n.position })), recalculateEdges, { deep: true })
watch(() => tree.value.edges.length, recalculateEdges)

onMounted(() => {
  recalculateEdges()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function onWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.05 : 0.05
  const newScale = Math.min(Math.max(scale.value + delta, 0.2), 3)

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

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

const pendingEdge = ref<{ sourceFieldId: string; sourceNodeId: string; isOut: boolean } | null>(null)

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function startEdge(fieldId: string, nodeId: string, isOut: boolean) {
  pendingEdge.value = { sourceFieldId: fieldId, sourceNodeId: nodeId, isOut }
}

function completeEdge(targetFieldId: string, targetNodeId: string) {
  if (!pendingEdge.value) return

  if (
    pendingEdge.value.sourceFieldId === targetFieldId &&
    pendingEdge.value.sourceNodeId === targetNodeId
  ) {
    pendingEdge.value = null
    return
  }

  const sourceNode = tree.value.nodes.find(n => n.id === pendingEdge.value!.sourceNodeId)
  const targetNode = tree.value.nodes.find(n => n.id === targetNodeId)
  const sourceField = sourceNode?.fields.find(f => f.id === pendingEdge.value!.sourceFieldId)
  const targetField = targetNode?.fields.find(f => f.id === targetFieldId)

  if (!sourceField || !targetField) {
    pendingEdge.value = null
    return
  }

  const sourceHasCustomConnectors = sourceField.connectors && sourceField.connectors.length > 0
  const targetHasCustomConnectors = targetField.connectors && targetField.connectors.length > 0

  if (!sourceHasCustomConnectors && !targetHasCustomConnectors) {
    if (!sourceField.out || !targetField.in) {
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
  const target = event.target as HTMLElement
  if (target.classList.contains('node-field-text')) return

  if (event.shiftKey) {
    const newSet = new Set(activeNodeIds.value)
    if (newSet.has(nodeId)) newSet.delete(nodeId)
    else newSet.add(nodeId)
    activeNodeIds.value = newSet
  } else {
    activeNodeIds.value = new Set([nodeId])
  }

  isDraggingNode.value = true
  currentNodeId.value = nodeId
  const node = tree.value.nodes.find(n => n.id === nodeId)
  if (!node) return
  const rect = (document.querySelector('.node-canvas') as HTMLElement).getBoundingClientRect()
  startPos.value = {
    x: (event.clientX - rect.left - panOffset.value.x) / scale.value - node.position.x,
    y: (event.clientY - rect.top - panOffset.value.y) / scale.value - node.position.y,
  }
  event.preventDefault()
}

function mouseDownCanvas(event: MouseEvent) {
  if (isDraggingNode.value) return
  const target = event.target as HTMLElement
  if (target.closest('.node-card')) return
  activeNodeIds.value = new Set()
  isPanning.value = true
  panStart.value = {
    x: event.clientX - panOffset.value.x,
    y: event.clientY - panOffset.value.y,
  }
}

const mousePos = ref<Position>({ x: 0, y: 0 })

function onMouseMove(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  mousePos.value = {
    x: (event.clientX - rect.left - panOffset.value.x) / scale.value,
    y: (event.clientY - rect.top - panOffset.value.y) / scale.value,
  }

  if (isDraggingNode.value && currentNodeId.value) {
    const node = tree.value.nodes.find(n => n.id === currentNodeId.value)
    if (node) {
      node.position = {
        x: (event.clientX - rect.left - panOffset.value.x) / scale.value - startPos.value.x,
        y: (event.clientY - rect.top - panOffset.value.y) / scale.value - startPos.value.y,
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
  if (isDraggingNode.value) resolveCollisions()
  isDraggingNode.value = false
  currentNodeId.value = null
  isPanning.value = false
}

const lastPinchDistance = ref<number | null>(null)

function onTouchStart(event: TouchEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

  if (event.touches.length === 1) {
    const touch = event.touches.item(0)!
    const target = touch.target as HTMLElement
    const nodeCard = target.closest('[data-node-id]') as HTMLElement | null
    const nodeId = nodeCard?.dataset.nodeId ?? null

    if (nodeId) {
      activeNodeIds.value = new Set([nodeId])
      isDraggingNode.value = true
      currentNodeId.value = nodeId
      const node = tree.value.nodes.find(n => n.id === nodeId)
      if (node) {
        startPos.value = {
          x: (touch.clientX - rect.left - panOffset.value.x) / scale.value - node.position.x,
          y: (touch.clientY - rect.top - panOffset.value.y) / scale.value - node.position.y,
        }
      }
    } else {
      activeNodeIds.value = new Set()
      isPanning.value = true
      panStart.value = {
        x: touch.clientX - panOffset.value.x,
        y: touch.clientY - panOffset.value.y,
      }
    }
  } else if (event.touches.length === 2) {
    isDraggingNode.value = false
    isPanning.value = false
    const touch0 = event.touches.item(0)!
    const touch1 = event.touches.item(1)!
    const dx = touch0.clientX - touch1.clientX
    const dy = touch0.clientY - touch1.clientY
    lastPinchDistance.value = Math.sqrt(dx * dx + dy * dy)
  }
}

function onTouchMove(event: TouchEvent) {
  event.preventDefault()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

  if (event.touches.length === 1) {
    const touch = event.touches.item(0)!
    if (isDraggingNode.value && currentNodeId.value) {
      const node = tree.value.nodes.find(n => n.id === currentNodeId.value)
      if (node) {
        node.position = {
          x: (touch.clientX - rect.left - panOffset.value.x) / scale.value - startPos.value.x,
          y: (touch.clientY - rect.top - panOffset.value.y) / scale.value - startPos.value.y,
        }
      }
    } else if (isPanning.value) {
      panOffset.value = {
        x: touch.clientX - panStart.value.x,
        y: touch.clientY - panStart.value.y,
      }
    }
  } else if (event.touches.length === 2) {
    const touch0 = event.touches.item(0)!
    const touch1 = event.touches.item(1)!
    const dx = touch0.clientX - touch1.clientX
    const dy = touch0.clientY - touch1.clientY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (lastPinchDistance.value !== null) {
      const pinchRatio = distance / lastPinchDistance.value
      const newScale = Math.min(Math.max(scale.value * pinchRatio, 0.2), 3)
      const midX = (touch0.clientX + touch1.clientX) / 2 - rect.left
      const midY = (touch0.clientY + touch1.clientY) / 2 - rect.top
      const scaleRatio = newScale / scale.value
      panOffset.value = {
        x: midX - scaleRatio * (midX - panOffset.value.x),
        y: midY - scaleRatio * (midY - panOffset.value.y),
      }
      scale.value = newScale
    }
    lastPinchDistance.value = distance
  }
}

function onTouchEnd() {
  if (isDraggingNode.value) resolveCollisions()
  isDraggingNode.value = false
  currentNodeId.value = null
  isPanning.value = false
  lastPinchDistance.value = null
}

function handleFieldClick(fieldId: string, nodeId: string, isOut: boolean) {
  if (isReadOnly.value) return
  if (pendingEdge.value) {
    if (pendingEdge.value.isOut && !isOut) {
      completeEdge(fieldId, nodeId)
    } else {
      pendingEdge.value = null
    }
  } else {
    startEdge(fieldId, nodeId, isOut)
  }
}

const activeNodeIds = ref<Set<string>>(new Set())

function centerNodes() {
  if (tree.value.nodes.length === 0) return
  const minX = Math.min(...tree.value.nodes.map(n => n.position.x))
  const minY = Math.min(...tree.value.nodes.map(n => n.position.y))
  const maxX = Math.max(...tree.value.nodes.map(n => n.position.x + NODE_WIDTH))
  const maxY = Math.max(...tree.value.nodes.map(n => n.position.y + getNodeHeight(n)))
  const contentWidth = maxX - minX
  const contentHeight = maxY - minY
  const viewport = document.querySelector('.node-canvas') as HTMLElement
  if (!viewport) return
  panOffset.value = {
    x: (viewport.clientWidth - contentWidth * scale.value) / 2 - minX * scale.value,
    y: (viewport.clientHeight - contentHeight * scale.value) / 2 - minY * scale.value,
  }
}

function autoLayout() {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80, marginx: 20, marginy: 20 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of tree.value.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: getNodeHeight(node) })
  }

  for (const edge of tree.value.edges) {
    if (edge.source.kind === 'field' && edge.target.kind === 'field') {
      g.setEdge(edge.source.nodeId, edge.target.nodeId)
    }
  }

  dagre.layout(g)

  for (const node of tree.value.nodes) {
    const pos = g.node(node.id)
    if (pos) {
      node.position.x = pos.x - NODE_WIDTH / 2
      node.position.y = pos.y - getNodeHeight(node) / 2
    }
  }
  centerNodes()
}

async function handleKeydown(event: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey

  if (cmdOrCtrl && event.key === 'a') {
    event.preventDefault()
    if (activeNodeIds.value.size === tree.value.nodes.length) {
      activeNodeIds.value = new Set()
    } else {
      activeNodeIds.value = new Set(tree.value.nodes.map(n => n.id))
    }
    return
  }

  if ((event.key === 'Delete' || event.key === 'Backspace') && activeNodeIds.value.size > 0) {
    if (isReadOnly.value) return
    event.preventDefault()
    tree.value.edges = tree.value.edges.filter(e => {
      const srcNodeId = e.source.kind === 'field' ? e.source.nodeId : e.source.nodeId
      const tgtNodeId = e.target.kind === 'field' ? e.target.nodeId : e.target.nodeId
      return !activeNodeIds.value.has(srcNodeId) && !activeNodeIds.value.has(tgtNodeId)
    })
    tree.value.nodes = tree.value.nodes.filter(n => !activeNodeIds.value.has(n.id))
    activeNodeIds.value = new Set()
    return
  }

  if (cmdOrCtrl && event.key === 'c' && activeNodeIds.value.size > 0) {
    event.preventDefault()
    const copiedNodes = tree.value.nodes
      .filter(n => activeNodeIds.value.has(n.id))
      .map(n => ({ ...n, fields: n.fields.map(f => ({ ...f })) }))
    const copiedNodeIds = new Set(copiedNodes.map(n => n.id))
    const copiedEdges = tree.value.edges.filter(e => {
      const srcNodeId = e.source.kind === 'field' ? e.source.nodeId : e.source.nodeId
      const tgtNodeId = e.target.kind === 'field' ? e.target.nodeId : e.target.nodeId
      return copiedNodeIds.has(srcNodeId) && copiedNodeIds.has(tgtNodeId)
    })
    try {
      await navigator.clipboard.writeText(JSON.stringify({ nodes: copiedNodes, edges: copiedEdges }))
    } catch (err) {
      console.error('[NodeTree] Failed to write to clipboard', err)
    }
    return
  }

  if (cmdOrCtrl && event.key === 'x' && activeNodeIds.value.size > 0) {
    if (isReadOnly.value) return
    event.preventDefault()
    const cutNodes = tree.value.nodes
      .filter(n => activeNodeIds.value.has(n.id))
      .map(n => ({ ...n, fields: n.fields.map(f => ({ ...f })) }))
    const cutNodeIds = new Set(cutNodes.map(n => n.id))
    const cutEdges = tree.value.edges.filter(e => {
      const srcNodeId = e.source.kind === 'field' ? e.source.nodeId : e.source.nodeId
      const tgtNodeId = e.target.kind === 'field' ? e.target.nodeId : e.target.nodeId
      return cutNodeIds.has(srcNodeId) && cutNodeIds.has(tgtNodeId)
    })
    try {
      await navigator.clipboard.writeText(JSON.stringify({ nodes: cutNodes, edges: cutEdges }))
    } catch (err) {
      console.error('[NodeTree] Failed to write to clipboard', err)
    }
    tree.value.edges = tree.value.edges.filter(e => {
      const srcNodeId = e.source.kind === 'field' ? e.source.nodeId : e.source.nodeId
      const tgtNodeId = e.target.kind === 'field' ? e.target.nodeId : e.target.nodeId
      return !cutNodeIds.has(srcNodeId) && !cutNodeIds.has(tgtNodeId)
    })
    tree.value.nodes = tree.value.nodes.filter(n => !activeNodeIds.value.has(n.id))
    activeNodeIds.value = new Set()
    return
  }

  if (cmdOrCtrl && event.key === 'v') {
    if (isReadOnly.value) return
    event.preventDefault()
    try {
      const text = await navigator.clipboard.readText()
      const subtree = JSON.parse(text) as { nodes: NodeTree['nodes'], edges: NodeTree['edges'] }
      if (!subtree.nodes || !Array.isArray(subtree.nodes)) return
      const minX = Math.min(...subtree.nodes.map(n => n.position.x))
      const minY = Math.min(...subtree.nodes.map(n => n.position.y))
      const nodeIdMap = new Map<string, string>()
      const fieldIdMap = new Map<string, string>()
      const newNodes = subtree.nodes.map(node => {
        const newId = generateId()
        nodeIdMap.set(node.id, newId)
        const newFields = node.fields.map(f => {
          const newFieldId = generateId()
          fieldIdMap.set(f.id, newFieldId)
          return { ...f, id: newFieldId }
        })
        return {
          ...node,
          id: newId,
          fields: newFields,
          position: {
            x: mousePos.value.x + (node.position.x - minX),
            y: mousePos.value.y + (node.position.y - minY),
          }
        }
      })
      const newEdges = subtree.edges.map(edge => {
        const newSource = edge.source.kind === 'field'
          ? { kind: 'field' as const, nodeId: nodeIdMap.get(edge.source.nodeId) ?? edge.source.nodeId, fieldId: fieldIdMap.get(edge.source.fieldId) ?? edge.source.fieldId }
          : { kind: 'node' as const, nodeId: nodeIdMap.get(edge.source.nodeId) ?? edge.source.nodeId }
        const newTarget = edge.target.kind === 'field'
          ? { kind: 'field' as const, nodeId: nodeIdMap.get(edge.target.nodeId) ?? edge.target.nodeId, fieldId: fieldIdMap.get(edge.target.fieldId) ?? edge.target.fieldId }
          : { kind: 'node' as const, nodeId: nodeIdMap.get(edge.target.nodeId) ?? edge.target.nodeId }
        return { ...edge, id: generateId(), source: newSource, target: newTarget }
      })
      tree.value.nodes.push(...newNodes)
      tree.value.edges.push(...newEdges)
      activeNodeIds.value = new Set(newNodes.map(n => n.id))
    } catch (err) {
      console.warn('[NodeTree] Nothing valid to paste from clipboard', err)
    }
    return
  }
}
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 node-canvas"
    :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
    @mousemove="onMouseMove"
    @mouseup="mouseUp"
    @mouseleave="mouseUp"
    @mousedown="mouseDownCanvas"
    @wheel.prevent="onWheel"
    @touchstart.passive="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Background pattern -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          v-if="backgroundPattern === 'grid'"
          id="grid-pattern"
          :width="20 * scale"
          :height="20 * scale"
          patternUnits="userSpaceOnUse"
          :x="panOffset.x % (20 * scale)"
          :y="panOffset.y % (20 * scale)"
        >
          <path :d="`M ${20 * scale} 0 L 0 0 0 ${20 * scale}`" fill="none" class="stroke-neutral-200 dark:stroke-neutral-800" stroke-width="0.5"/>
        </pattern>
        <pattern
          v-if="backgroundPattern === 'checkerboard'"
          id="checker-pattern"
          :width="20 * scale"
          :height="20 * scale"
          patternUnits="userSpaceOnUse"
          :x="panOffset.x % (20 * scale)"
          :y="panOffset.y % (20 * scale)"
        >
          <rect :width="10 * scale" :height="10 * scale" fill="currentColor" class="text-neutral-200 dark:text-neutral-800"/>
          <rect :x="10 * scale" :y="10 * scale" :width="10 * scale" :height="10 * scale" fill="currentColor" class="text-neutral-200 dark:text-neutral-800"/>
        </pattern>
      </defs>
      <rect v-if="backgroundPattern !== 'none'" width="100%" height="100%" :fill="`url(#${backgroundPattern === 'grid' ? 'grid-pattern' : 'checker-pattern'})`"/>
    </svg>

    <!-- Top left - read only toggle -->
    <button
      class="absolute top-3 left-3 z-50 flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300 text-xs font-medium"
      @click.stop="isReadOnly = !isReadOnly"
      :title="isReadOnly ? 'Switch to Edit Mode' : 'Switch to Read-Only Mode'"
    >
      <svg v-if="isReadOnly" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </svg>
      {{ isReadOnly ? 'Read Only' : 'Edit' }}
    </button>

    <!-- Buttons top right -->
    <div class="absolute top-3 right-3 z-50 flex gap-2">
      <!-- Background pattern toggle -->
      <button
        class="p-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300"
        :title="`Background: ${backgroundPattern}`"
        @click.stop="backgroundPattern = backgroundPattern === 'none' ? 'grid' : backgroundPattern === 'grid' ? 'checkerboard' : 'none'"
      >
        <svg v-if="backgroundPattern === 'grid'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
        <svg v-else-if="backgroundPattern === 'checkerboard'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="5" height="5"/><rect x="12" y="2" width="5" height="5"/>
          <rect x="7" y="7" width="5" height="5"/><rect x="17" y="7" width="5" height="5"/>
          <rect x="2" y="12" width="5" height="5"/><rect x="12" y="12" width="5" height="5"/>
          <rect x="7" y="17" width="5" height="5"/><rect x="17" y="17" width="5" height="5"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
      </button>

      <!-- Auto layout button -->
      <button
        class="p-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-neutral-700 dark:text-neutral-300"
        title="Auto layout nodes"
        @click.stop="autoLayout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
          <rect x="3" y="16" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/>
          <line x1="8" y1="5.5" x2="16" y2="5.5"/><line x1="8" y1="18.5" x2="16" y2="18.5"/>
          <line x1="5.5" y1="8" x2="5.5" y2="16"/><line x1="18.5" y1="8" x2="18.5" y2="16"/>
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
      :style="{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})` }"
    >
      <!-- SVG layer for edges -->
      <svg class="absolute pointer-events-none" style="width: 3000px; height: 3000px; overflow: visible">
        <template v-for="edge in otherEdges" :key="edge.id">
          <g
            v-if="edgeCoords.get(edge.id)"
            :class="isReadOnly ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'"
            @click="!isReadOnly && removeEdge(edge.id)"
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
        :is-active="activeNodeIds.has(node.id)"
        @field-click="handleFieldClick"
        @start-drag="(e: MouseEvent) => mouseDownNode(e, node.id)"
      />
    </div>

    <!-- Top SVG layer for dragged node edges -->
    <svg
      class="absolute inset-0 pointer-events-none"
      style="width: 100%; height: 100%; overflow: visible; z-index: 100"
    >
      <g :transform="`translate(${panOffset.x}, ${panOffset.y}) scale(${scale})`">
        <template v-for="edge in draggedNodeEdges" :key="edge.id + '-top'">
          <g v-if="edgeCoords.get(edge.id)" class="pointer-events-none">
            <EdgeView :edge="edge" v-bind="edgeCoords.get(edge.id)!"/>
          </g>
        </template>
      </g>
    </svg>
  </div>
</template>