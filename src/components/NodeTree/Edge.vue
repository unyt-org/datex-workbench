<script setup lang="ts">
import type { Edge } from '@/types/NodeTree/node-tree'

const props = defineProps<{
  edge?: Edge
  x1: number
  y1: number
  x2: number
  y2: number
}>()

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`
}
</script>

<template>
  <path
    :d="bezierPath(props.x1, props.y1, props.x2, props.y2)"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="text-neutral-400 dark:text-neutral-500"
  />
</template>