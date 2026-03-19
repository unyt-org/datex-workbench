<script setup lang="ts">
import type { Edge, EdgeStyle } from '@/types/NodeTree/node-tree'

const props = defineProps<{
  edge?: Edge
  x1: number
  y1: number
  x2: number
  y2: number
}>()

function getPath(x1: number, y1: number, x2: number, y2: number, style: EdgeStyle = 'bezier'): string {
  if (style === 'straight') {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }
  if (style === 'step') {
    const midX = (x1 + x2) / 2
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
  }
  // bezier (default)
  const cx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`
}

function getEdgeColor(edgetype: string): string {
  const colors: Record<string, string> = {
    websocket: '#3b82f6',  // blue
    http:      '#22c55e',  // green
    tcp:       '#a855f7',  // purple
    webpush:   '#f97316',  // orange
    local:     '#6b7280',  // gray
  }
  return colors[edgetype] ?? '#9ca3af'
}
</script>

<template>
  <g>
  <path
    :d="getPath(props.x1, props.y1, props.x2, props.y2, props.edge?.style)"
    fill="none"
    :stroke="getEdgeColor(props.edge?.edgetype ?? '')"
    stroke-width="2"
    opacity="0.8"
    class="text-neutral-400 dark:text-neutral-500"
  />
  <!-- Arrow for unidirectional -->
  <polygon
      v-if="props.edge?.direction === 'unidirectional'"
      :points="`${props.x2},${props.y2} ${props.x2 - 8},${props.y2 - 4} ${props.x2 - 8},${props.y2 + 4}`"
      :fill="getEdgeColor(props.edge?.edgetype ?? '')"
    />
  </g>
</template>