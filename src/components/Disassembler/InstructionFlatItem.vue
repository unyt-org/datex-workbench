<script setup lang="ts">
import { computed } from 'vue'
import {
  type FlatInstruction,
  type Instruction,
  type InstructionParts,
  getInstructionParts,
} from '@/types/disassembler'
import InstructionLabel from './InstructionLabel.vue'

const props = withDefaults(
  defineProps<{
    instruction: FlatInstruction
    showNested: boolean
    indentLevel?: number
  }>(),
  { indentLevel: 0 }
)

const parts = computed<InstructionParts>(() => getInstructionParts(props.instruction))

const indent = computed(() => '  '.repeat(props.indentLevel))

/** Inner instruction list (3rd element for FlatInstruction is Instruction[]) */
const innerInstructions = computed<Instruction[]>(() => {
  if (!props.showNested) return []
  const inner = parts.value.inner
  if (Array.isArray(inner)) return inner as Instruction[]
  return []
})
</script>

<template>
  <div class="whitespace-pre leading-7 text-sm font-mono">
    <span class="text-gray-600">{{ indent }}</span>
    <InstructionLabel :name="parts.name" :meta="parts.meta" />
  </div>

  <InstructionFlatItem
    v-for="(nested, i) in innerInstructions"
    :key="i"
    :instruction="(nested as FlatInstruction)"
    :show-nested="showNested"
    :indent-level="indentLevel + 1"
  />
</template>

<script lang="ts">
export default { name: 'InstructionFlatItem' }
</script>