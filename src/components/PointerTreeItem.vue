<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import type { DIF } from '@/lib/runtime'

// Props
interface PointerTreeItemProps {
  nodeId: string
  label: string
  value: DIF.Definitions.DIFContainer
  expandedNodes: Set<string>
  depth?: number
}

const props = withDefaults(defineProps<PointerTreeItemProps>(), {
  depth: 0
})

// Emits
const emit = defineEmits<{
  'node-click': [nodeId: string, value: DIF.Definitions.DIFContainer]
  'node-toggle': [nodeId: string]
}>()

// Type configuration (same as PointerView)
interface TypeConfig {
  displayName: string
  preview: (value: any) => string
  isExpandable: boolean
}

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  'text': {
    displayName: 'text',
    preview: (value: string) => value.length > 30 ? `"${value.substring(0, 30)}..."` : `"${value}"`,
    isExpandable: false
  },
  
  'endpoint': {
    displayName: 'endpoint',
    preview: (value: any) => {
      if (typeof value === 'string') return value
      if (value && typeof value === 'object' && 'name' in value) return `@${value.name}`
      return String(value)
    },
    isExpandable: false
  },
  
  'boolean': {
    displayName: 'boolean',
    preview: (value: boolean) => value ? 'true' : 'false',
    isExpandable: false
  },
  
  'integer': {
    displayName: 'integer',
    preview: (value: number) => String(value),
    isExpandable: false
  },
  
  'decimal': {
    displayName: 'decimal',
    preview: (value: number) => String(value),
    isExpandable: false
  },
  
  'null': {
    displayName: 'null',
    preview: () => 'null',
    isExpandable: false
  },
  
  'list': {
    displayName: 'list',
    preview: (value: any[]) => `[${value.length}]`,
    isExpandable: true
  },
  
  'map': {
    displayName: 'map',
    preview: (value: any[]) => `Map(${value.length})`,
    isExpandable: true
  },
}

// Get type name from DIF value
function getTypeName(difContainer: DIF.Definitions.DIFContainer): string {
  const value = difContainer.value
  
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return 'text'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal'
  if (Array.isArray(value)) return 'list'
  if (value instanceof Map) return 'map'
  if (typeof value === 'object') {
    if ('name' in value || 'endpoint' in value || 'location' in value) {
      return 'endpoint'
    }
  }
  
  return 'null' // fallback to null for unknown types
}

// Check if expandable
function isExpandable(difContainer: DIF.Definitions.DIFContainer): boolean {
  const typeName = getTypeName(difContainer)
  return TYPE_CONFIGS[typeName]?.isExpandable ?? false
}

// Get value preview
function getValuePreview(difContainer: DIF.Definitions.DIFContainer): string {
  const value = difContainer.value
  const typeName = getTypeName(difContainer)
  
  return TYPE_CONFIGS[typeName]?.preview(value) || 'null'
}

// Get children
function getChildren(difContainer: DIF.Definitions.DIFContainer): Array<[string, DIF.Definitions.DIFValueContainer]> {
  const value = difContainer.value
  
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
  <div>
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
        <span 
          :class="depth === 0 ? 'font-mono text-sm text-primary' : 'text-sm font-medium'"
        >
          {{ label }}<span v-if="depth > 0">:</span>
        </span>
        <span class="text-xs text-muted-foreground">{{ getTypeName(value) }}</span>
        <span class="text-sm text-foreground/70 truncate">{{ getValuePreview(value) }}</span>
      </div>
    </div>
    
    <!-- Children (RECURSIVE - this component calls itself!) -->
    <div
      v-if="expanded && isExpandable(value)"
      class="ml-6 border-l border-border pl-2"
    >
      <PointerTreeItem
        v-for="[childKey, childValue] in getChildren(value)"
        :key="childKey"
        :node-id="getChildId(nodeId, childKey)"
        :label="childKey"
        :value="childValue"
        :expanded-nodes="expandedNodes"
        :depth="depth + 1"
        @node-click="emit('node-click', $event, childValue)"
        @node-toggle="emit('node-toggle', $event)"
      />
    </div>
  </div>
</template>
