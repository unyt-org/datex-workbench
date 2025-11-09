<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import type { DIF } from '@/lib/runtime'
import { TYPE_CONFIGS, getTypeName } from '@/lib/pointer-types'

// Props
interface PointerTreeItemProps {
  nodeId: string
  label: string
  value: DIF.Definitions.DIFContainer
  expandedNodes: Set<string>
  showFullIds?: boolean
  showDataTypes?: boolean
  showIndices?: boolean
  hideTypeHintsForPrimitives?: boolean
  depth?: number
}

const props = withDefaults(defineProps<PointerTreeItemProps>(), {
  depth: 0,
  showFullIds: false,
  showDataTypes: false,
  showIndices: true,
  hideTypeHintsForPrimitives: true,
})

// Emits
const emit = defineEmits<{
  'node-click': [nodeId: string, value: DIF.Definitions.DIFContainer]
  'node-toggle': [nodeId: string]
}>()

// Check if expandable
function isExpandable(difContainer: DIF.Definitions.DIFContainer): boolean {
  const typeName = getTypeName(difContainer)
  return TYPE_CONFIGS[typeName]?.isExpandable ?? false
}

// Extract the actual value from a DIF container, unwrapping nested value properties
function extractValue(difContainer: any): any {
  if (difContainer && typeof difContainer === 'object' && 'value' in difContainer) {
    return difContainer.value
  }
  return difContainer
}

// Get value preview
function getValuePreview(difContainer: DIF.Definitions.DIFContainer): string {
  const value = extractValue(difContainer)
  const typeName = getTypeName(difContainer)
  
  // Build the preview string
  let preview = ''
  
  // Determine if we should show type hint
  const shouldShowTypeHint = props.showDataTypes && !(
    props.hideTypeHintsForPrimitives && 
    (typeName === 'integer' || typeName === 'decimal' || typeName === 'boolean' || typeName === 'text')
  )
  
  // Add data type if conditions are met
  if (shouldShowTypeHint) {
    preview = `"${typeName}" = `
  }
  
  // For non-expandable types, show the actual value
  if (!TYPE_CONFIGS[typeName]?.isExpandable) {
    if (typeName === 'text') preview += `"${value}"`
    else if (typeName === 'boolean') preview += value ? 'true' : 'false'
    else if (typeName === 'integer' || typeName === 'decimal') preview += String(value)
    else if (typeName === 'null') preview += 'null'
    else preview += TYPE_CONFIGS[typeName]?.preview(value) || 'null'
  } else {
    preview += TYPE_CONFIGS[typeName]?.preview(value) || 'null'
  }
  
  return preview
}

// Get children
function getChildren(difContainer: DIF.Definitions.DIFContainer): Array<[string, DIF.Definitions.DIFValueContainer]> {
  // Only compute children if node is expanded (lazy evaluation)
  if (!expanded.value) {
    return []
  }
  
  // Check if it's a DIF map type (type: '0c0000')
  if (typeof difContainer === 'object' && difContainer !== null && 'type' in difContainer && difContainer.type === '0c0000') {
    const value = extractValue(difContainer)
    // DIF maps store their value as an object with key-value pairs
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v]) => [k, v])
    }
  }
  
  const value = extractValue(difContainer)
  
  if (Array.isArray(value)) {
    return (value as DIF.Definitions.DIFArray).map((item, index) => [String(index), item])
  }
  
  if (value instanceof Map) {
    return Array.from((value as Map<any, any>).entries()).map(([k, v]) => {
      const keyDisplay = typeof k === 'string' ? k : 
                        typeof k === 'number' ? String(k) :
                        typeof k === 'object' ? JSON.stringify(k) : String(k)
      return [keyDisplay, v]
    })
  }
  
  return []
}

// Computed children list (cached and only recomputes when expanded or value changes)
const children = computed(() => getChildren(props.value))

// Generate child ID
function getChildId(parentId: string, childKey: string): string {
  return `${parentId}.${childKey}`
}

// Computed
const expanded = computed(() => props.expandedNodes.has(props.nodeId))

// Methods
function toggleExpanded(event: Event) {
  event.stopPropagation()
  emit('node-toggle', props.nodeId)
}

function handleClick() {
  emit('node-click', props.nodeId, props.value)
}
</script>

<template>
  <div v-memo="[expanded, label, showDataTypes, showIndices, hideTypeHintsForPrimitives]">
    <!-- This node -->
    <div
      class="flex items-center gap-1 p-2 hover:bg-accent cursor-pointer rounded-md"
      :class="{ 'hover:bg-accent/50': depth > 0 }"
      @click="handleClick"
    >
      <!-- Expand/Collapse chevron -->
      <button
        v-if="isExpandable(value)"
        @click="toggleExpanded"
        class="shrink-0 hover:bg-accent-foreground/10 rounded p-0.5"
      >
        <ChevronRight
          v-if="!expanded"
          :class="depth === 0 ? 'h-4 w-4' : 'h-3 w-3'"
        />
        <ChevronDown
          v-else
          :class="depth === 0 ? 'h-4 w-4' : 'h-3 w-3'"
        />
      </button>
      <div v-else :class="depth === 0 ? 'w-5' : 'w-4'" class="shrink-0"></div>
      
      <!-- Content -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- For top-level pointers (depth 0): show pointer ID in blue -->
        <span 
          v-if="depth === 0"
          class="font-mono text-sm unyt-blue font-semibold"
        >
          {{ label }}
        </span>
        
        <!-- For nested items (depth > 0): show key -->
        <span 
          v-if="depth > 0 && showIndices"
          class="text-sm font-medium"
        >
          {{ label }}:
        </span>
        
        <!-- Show type-based preview or opening bracket when expanded -->
        <span v-if="!expanded" class="text-sm text-foreground/70 truncate">
          {{ getValuePreview(value) }}
        </span>
        <span v-else-if="isExpandable(value)" class="text-sm text-foreground/70">
          {{ getTypeName(value) === 'list' ? '[' : '{' }}
        </span>
      </div>
    </div>
    
    <!-- Children (RECURSIVE - this component calls itself!) -->
    <div
      v-if="expanded && isExpandable(value)"
      class="ml-6 border-l border-border pl-2"
    >
      <PointerTreeItem
        v-for="[childKey, childValue] in children"
        :key="childKey"
        :node-id="getChildId(nodeId, childKey)"
        :label="childKey"
        :value="childValue"
        :expanded-nodes="expandedNodes"
        :show-full-ids="showFullIds"
        :show-data-types="showDataTypes"
        :show-indices="showIndices"
        :hide-type-hints-for-primitives="hideTypeHintsForPrimitives"
        :depth="depth + 1"
        @node-click="emit('node-click', $event, childValue)"
        @node-toggle="emit('node-toggle', $event)"
      />
      
      <!-- Closing bracket -->
      <div class="p-2 text-sm text-foreground/70">
        {{ getTypeName(value) === 'list' ? ']' : '}' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.unyt-blue {
  color: rgb(42, 170, 215);
}
</style>
