<script setup lang="ts">
import { computed, inject } from 'vue'
import type { DIF } from '@unyt/datex'
import { usePointerPreferences } from '@/composable/usePointerPreferences'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getTypeName } from '@/lib/pointer-types'

// Props
interface PointerRefInlineProps {
  pointerId: string
}

const props = defineProps<PointerRefInlineProps>()

// Emits
const emit = defineEmits<{
  click: [pointerId: string]
}>()

// Inject the pointers map
const pointers = inject<Map<string, DIF.Definitions.DIFContainer>>('pointers')

// Use preferences composable
const { preferences } = usePointerPreferences()

// Compute display ID based on preferences
const displayId = computed(() => {
  if (preferences.value.show_full_pointer_ids) {
    return props.pointerId
  }
  
  // Show abbreviated ID (last 4 chars)
  const numericPart = props.pointerId.slice(1) // Remove $
  if (numericPart.length > 4) {
    return `$${numericPart.slice(-4)}`
  }
  
  return props.pointerId
})

// Get the value preview for the pointer
const valuePreview = computed(() => {
  if (!pointers) return ''
  
  const difContainer = pointers.get(props.pointerId)
  if (!difContainer) return ''
  
  // Extract value from DIF container
  const value = typeof difContainer === 'object' && difContainer !== null && 'value' in difContainer
    ? (difContainer as Record<string, unknown>).value
    : difContainer
  
  const typeName = getTypeName(difContainer)
  
  // Format preview based on type
  if (typeName === 'text') return `"${value}"`
  if (typeName === 'boolean') return value ? 'true' : 'false'
  if (typeName === 'integer' || typeName === 'decimal') return String(value)
  if (typeName === 'null') return 'null'
  if (typeName === 'list') return '[...]'
  if (typeName === 'map' || typeName === 'object') return '{...}'
  
  return String(value)
})

// Handle click
function handleClick() {
  emit('click', props.pointerId)
}
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          @click.stop="handleClick"
          class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20"
        >
          <span class="font-mono">{{ displayId }}</span>
          <span v-if="valuePreview" class="text-foreground/60 font-normal">→ {{ valuePreview }}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p class="text-xs font-mono">{{ pointerId }}</p>
        <p v-if="valuePreview" class="text-xs text-muted-foreground">Value: {{ valuePreview }}</p>
        <p class="text-xs text-muted-foreground mt-1">Click to jump to definition</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
