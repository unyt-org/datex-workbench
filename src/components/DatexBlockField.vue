<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

defineProps({
  field: {
    type: Object,
    required: true,
  },
})

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}
</script>

<template>
  <div class="BlockProtocolField">
    <Tooltip>
      <TooltipTrigger>
        <div class="FieldBytes">
          {{ bufferToHex(field.bytes) }}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>{{ field.name }}</div>
        <div>parsed Value: {{ field.parsedValue }}</div>
      </TooltipContent>
    </Tooltip>
  </div>
</template>

<style>
.BlockProtocolField {
  grid-column: span 1;
}

.FieldBytes {
  background-color: var(--color-chart-3);
  margin: 0.1rem;
  border-radius: 0.3rem;
}
</style>
