<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Node } from '@/types/NodeTree/node-tree'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  'field-click': [fieldId: string, nodeId: string, isOut: boolean]
}>()

</script>

<template>
  <Card
    class="absolute w-56 cursor-grab active:cursor-grabbing select-none"
    :style="{ left: `${node.position.x}px`, top: `${node.position.y}px` }"
  >
    <CardHeader class="pb-2 pt-3 px-3">
      <CardTitle class="text-sm font-semibold">{{ props.node.name ?? props.node.id }}</CardTitle>
    </CardHeader>
    <CardContent class="px-0 pb-2">
      <div v-for="field in node.fields" :key="field.id" class="relative flex items-center px-3 py-0.5 text-xs">
        <!-- Left dot (in) -->
        <span
  v-if="field.in"
  class="absolute -left-1.5 w-3 h-3 rounded-full bg-neutral-400 hover:bg-green-400 cursor-crosshair border-2 border-background transition-colors"
  :data-field-id="field.id + '-in'"
  @click.stop="emit('field-click', field.id, props.node.id, false)"
/>
        <span class="flex-1 text-center text-muted-foreground">{{ field.name ?? field.id }}</span>
        <!-- Right dot (out) -->
        <span
  v-if="field.out"
  class="absolute -right-1.5 w-3 h-3 rounded-full bg-blue-400 hover:bg-blue-500 cursor-crosshair border-2 border-background transition-colors"
  :data-field-id="field.id + '-out'"
  @click.stop="emit('field-click', field.id, props.node.id, true)"
/>
      </div>
    </CardContent>
  </Card>
</template>