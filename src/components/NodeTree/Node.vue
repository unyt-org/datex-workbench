<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Node } from '@/types/NodeTree/node-tree'

const props = defineProps<{
  node: Node
  isDragging?: boolean
}>()

const emit = defineEmits<{
  'field-click': [fieldId: string, nodeId: string, isOut: boolean]
  'start-drag': [event: MouseEvent]
}>()

</script>

<template>
  <Card
    class="absolute w-56 select-none transition-shadow"
    :class="isDragging ? 'z-50 shadow-2xl' : 'z-10 shadow-sm'"
    :style="{ left: `${node.position.x}px`, top: `${node.position.y}px` }"
  >
  <!-- Drag handle - only this area is draggable -->
    <CardHeader class="pb-2 pt-3 px-3 cursor-grab active:cursor-grabbing"
    @mousedown.left.stop="$emit('start-drag', $event)">
      <CardTitle class="text-sm font-semibold">{{ props.node.name ?? props.node.id }}</CardTitle>
    </CardHeader>

    <CardContent class="px-0 pb-2">
       <!-- Default slot for custom content -->
       <slot>
        <!-- Default field rendering -->
      <div v-for="field in node.fields" :key="field.id" class="relative flex items-center px-3 py-0.5 text-xs">
        <!-- Left dot (in) - only if no custom connectors defined  -->

        <template v-if="!field.connectors?.length">

        <span
  v-if="field.in"
  class="absolute -left-1.5 w-3 h-3 rounded-full bg-neutral-400 hover:bg-green-400 cursor-crosshair border-2 border-background transition-colors"
  :data-field-id="field.id + '-in'"
  @click.stop="emit('field-click', field.id, props.node.id, false)"
/>

        <!-- Right dot (out) -->
        <span
  v-if="field.out"
  class="absolute -right-1.5 w-3 h-3 rounded-full bg-blue-400 hover:bg-blue-500 cursor-crosshair border-2 border-background transition-colors"
  :data-field-id="field.id + '-out'"
  @click.stop="emit('field-click', field.id, props.node.id, true)"
/>
</template>

<!-- Custom connectors -->
<template v-else>
    <span
      v-for="connector in field.connectors"
      :key="connector.id"
      class="absolute w-3 h-3 rounded-full border-2 border-background transition-colors cursor-crosshair"
      :class="{
        '-left-1.5': connector.side === 'left',
        '-right-1.5': connector.side === 'right',
        'bg-neutral-400 hover:bg-green-400': connector.side === 'left',
        'bg-blue-400 hover:bg-blue-500': connector.side === 'right',
      }"
      :data-field-id="field.id + '-' + (connector.side === 'left' ? 'in' : 'out')"
      :title="connector.allowedTypes?.join(', ') ?? 'any'"
      @click.stop="emit('field-click', field.id, props.node.id, connector.side === 'right')"
    />
  </template>

  <span class="flex-1 text-center text-muted-foreground cursor-text">
    {{ field.name ?? field.id }}
  </span>

      </div>
      </slot>
    </CardContent>
  </Card>
</template>