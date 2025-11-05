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

const includesFlags = (str: string): boolean => str.includes("Flags");
const hasParsedValue = (obj: object): boolean => 'parsedValue' in obj;
</script>

<template>
  <div v-if="!field.subFields" class="BlockProtocolField">
    <Tooltip>
      <TooltipTrigger class="FieldBytes">
        <div>
          {{ bufferToHex(field.bytes) }}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>{{ field.name }}</div>
        <div v-if="hasParsedValue(field)">Value: {{ field.parsedValue }}</div>
      </TooltipContent>
    </Tooltip>
  </div>

  <div v-else-if="includesFlags(field.name)" class="BlockProtocolField">
    <Tooltip>
      <TooltipTrigger class="FieldBytes">
        <div>
          {{ bufferToHex(field.bytes) }}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>{{ field.name }}</div>
        <br />
        <div v-for="(subField, index) in field.subFields[0]" :key="index">
          <div>{{ subField.name }}</div>
          <div v-if="hasParsedValue(subField)">Value: {{ subField.parsedValue }}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  </div>

  <div v-else class="BlockProtocolField" v-for="(subField, index) in field.subFields" :key="index">
    <Tooltip>
      <TooltipTrigger class="FieldBytes">
        <div>
          {{ bufferToHex(subField[0].bytes) }}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>{{ subField[0].name }}</div>
        <div v-if="hasParsedValue(subField[0])">Value: {{ subField[0].parsedValue }}</div>
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
