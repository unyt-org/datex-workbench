<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Node } from '@/types/NodeTree/node-tree'

const props = defineProps<{
  node: Node
  isDragging?: boolean
  isActive?: boolean
}>()

const emit = defineEmits<{
  'field-click': [fieldId: string, nodeId: string, isOut: boolean]
  'start-drag': [event: MouseEvent]
}>()

</script>

<template>
  <Card
  class="absolute w-56 select-none transition-shadow node-card cursor-grab active:cursor-grabbing"
  :class="[
    isDragging ? 'z-50 shadow-2xl' : 'z-10 shadow-sm',
    isActive ? 'border-2 border-blue-500 dark:border-blue-400' : ''
  ]"
  :style="{ left: `${node.position.x}px`, top: `${node.position.y}px` }"
  @mousedown.left.stop="$emit('start-drag', $event)"
>
  <template v-for="field in node.fields" :key="'top-' + field.id">
    <template v-if="field.connectors?.length">
      <span
        v-for="connector in field.connectors.filter(c => c.side === 'top')"
        :key="connector.id"
        class="absolute -top-1.5 w-3 h-3 rounded-full bg-blue-400 hover:bg-blue-500 cursor-crosshair border-2 border-background transition-colors"
        :style="{ left: '50%', transform: 'translateX(-50%)' }"
        :data-field-id="field.id + '-top'"
        :title="connector.allowedTypes?.join(', ') ?? 'any'"
        @click.stop="emit('field-click', field.id, props.node.id, true)"
      />
    </template>
  </template>

  <!-- Bottom connectors -->
  <template v-for="field in node.fields" :key="'bottom-' + field.id">
    <template v-if="field.connectors?.length">
      <span
        v-for="connector in field.connectors.filter(c => c.side === 'bottom')"
        :key="connector.id"
        class="absolute -bottom-1.5 w-3 h-3 rounded-full bg-neutral-400 hover:bg-green-400 cursor-crosshair border-2 border-background transition-colors"
        :style="{ left: '50%', transform: 'translateX(-50%)' }"
        :data-field-id="field.id + '-bottom'"
        :title="connector.allowedTypes?.join(', ') ?? 'any'"
        @click.stop="emit('field-click', field.id, props.node.id, false)"
      />
    </template>
  </template>
  <!-- Drag handle - only this area is draggable -->
    <CardHeader class="pb-2 pt-3 px-3 cursor-grab active:cursor-grabbing">
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
  <template v-for="connector in field.connectors" :key="connector.id">
    <!-- Left connector -->
    <span
      v-if="connector.side === 'left'"
      class="absolute -left-1.5 w-3 h-3 rounded-full bg-neutral-400 hover:bg-green-400 cursor-crosshair border-2 border-background transition-colors"
      :data-field-id="field.id + '-in'"
      :title="connector.allowedTypes?.join(', ') ?? 'any'"
      @click.stop="emit('field-click', field.id, props.node.id, false)"
    />
    <!-- Right connector -->
    <span
      v-if="connector.side === 'right'"
      class="absolute -right-1.5 w-3 h-3 rounded-full bg-blue-400 hover:bg-blue-500 cursor-crosshair border-2 border-background transition-colors"
      :data-field-id="field.id + '-out'"
      :title="connector.allowedTypes?.join(', ') ?? 'any'"
      @click.stop="emit('field-click', field.id, props.node.id, true)"
    />

  </template>
</template>

  <span class="flex-1 text-center text-muted-foreground cursor-text select-text node-field-text">
    {{ field.name ?? field.id }}
  </span>

      </div>
      </slot>
    </CardContent>
  </Card>
</template>