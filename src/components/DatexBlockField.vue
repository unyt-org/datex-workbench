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

<style scoped>

.FieldBytes {
  background-color: var(--color-chart-3);
  text-align: left;
  border-radius: 0.3rem;
  padding: 0.1ch 0.3ch;
  /** each Field itself is padded with 0.3ch+0.3ch
      plus gap of flex items of 0.4ch
      ensures that all monospace byte characters stay aligned vertically
  */

  user-select: text !important; /* Force text selection so you can copy if needed*/
  -webkit-user-select: text !important; /* Safari */
  -moz-user-select: text !important; /* Firefox */
  -ms-user-select: text !important; /* IE/Edge */
}
</style>
