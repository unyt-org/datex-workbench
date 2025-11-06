<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
import type { DIF } from '@/lib/runtime'

// Props interface
interface PointerViewProps {
  class?: HTMLAttributes['class']
  pointers: Map<string, DIF.Definitions.DIFContainer>
  selectedPointerId?: string | null
  searchPlaceholder?: string
  defaultExpanded?: boolean
}

// Define props with defaults
const props = withDefaults(defineProps<PointerViewProps>(), {
  searchPlaceholder: 'Search...',
  defaultExpanded: false,
})

// ========================================
// DIF Type Helpers
// ========================================

// Supported type configuration - easy to extend
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
  
  'object': {
    displayName: 'object',
    preview: (value: Record<string, any>) => {
      const keys = Object.keys(value)
      return keys.length > 0 ? `{${keys.length} properties}` : '{...}'
    },
    isExpandable: true
  },
  
  'pointer': {
    displayName: 'pointer',
    preview: (value: string) => value,
    isExpandable: false
  },
}

// Get type name from DIF value
function getTypeName(difContainer: DIF.Definitions.DIFContainer): string {
  if (typeof difContainer === 'string') return 'pointer'
  
  // Since DIF type is undefined, we need to infer from the value
  const value = difContainer.value
  
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return 'text'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal'
  if (Array.isArray(value)) return 'list'
  if (value instanceof Map) return 'map'
  if (typeof value === 'object') return 'object'
  
  return 'object'
}

// Get display name for a type
function getTypeDisplayName(typeName: string): string {
  return TYPE_CONFIGS[typeName]?.displayName || typeName
}

// Check if a pointer is expandable
function isExpandable(difContainer: DIF.Definitions.DIFContainer): boolean {
  const typeName = getTypeName(difContainer)
  return TYPE_CONFIGS[typeName]?.isExpandable ?? false
}

// Get preview value for display
function getValuePreview(difContainer: DIF.Definitions.DIFContainer): string {
  if (typeof difContainer === 'string') {
    return difContainer
  }
  
  const value = difContainer.value
  const typeName = getTypeName(difContainer)
  
  return TYPE_CONFIGS[typeName]?.preview(value) || String(value)
}


// Emits to communicate with parent
const emit = defineEmits<{
  'pointer-click': [pointerId: string, value: DIF.Definitions.DIFContainer]
  'pointer-expand': [pointerId: string, expanded: boolean]
  'search': [query: string]
  'update:selectedPointerId': [id: string | null]
}>()



// State
const searchQuery = ref('')
const expandedPointers = ref<Set<string>>(new Set())

// Computed values
const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())
const searchTokens = computed(() =>
  normalizedSearchQuery.value ? normalizedSearchQuery.value.split(/\s+/) : []
)
const hasSearchQuery = computed(() => searchTokens.value.length > 0)

// ========================================
// Search Filtering Logic
// ========================================

/**
 * Filters pointers Map based on search query
 * A pointer is included if its ID matches the search
 */
const filteredPointers = computed(() => {
  if (!hasSearchQuery.value) {
    return props.pointers
  }

  const filtered = new Map<string, DIF.Definitions.DIFContainer>()
  for (const [pointerId, value] of props.pointers) {
    const idLower = pointerId.toLowerCase()
    if (searchTokens.value.some(token => idLower.includes(token))) {
      filtered.set(pointerId, value)
    }
  }
  return filtered
})

// Search handler - emits to parent for external state management if needed
function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  emit('search', target.value)
}

// Toggle pointer expansion
function togglePointer(pointerId: string, event?: Event) {
  // Stop propagation to prevent triggering click handler
  event?.stopPropagation()
  
  if (expandedPointers.value.has(pointerId)) {
    expandedPointers.value.delete(pointerId)
    emit('pointer-expand', pointerId, false)
  } else {
    expandedPointers.value.add(pointerId)
    emit('pointer-expand', pointerId, true)
  }
}

// Handle pointer click
function handlePointerClick(pointerId: string, value: DIF.Definitions.DIFContainer) {
  emit('pointer-click', pointerId, value)
  emit('update:selectedPointerId', pointerId)
}

// Check if pointer is expanded
function isExpanded(pointerId: string): boolean {
  return expandedPointers.value.has(pointerId)
}

/**
 * Get children entries for an expanded pointer
 */
function getChildren(difContainer: DIF.Definitions.DIFContainer): Array<[string, DIF.Definitions.DIFValueContainer]> {
  if (typeof difContainer === 'string') return []
  
  const value = difContainer.value
  
  // Check the actual value type to determine how to extract children
  if (Array.isArray(value)) {
    return (value as DIF.Definitions.DIFArray).map((item, index) => [String(index), item])
  }
  
  if (value instanceof Map) {
    return Array.from((value as Map<any, any>).entries()).map(([k, v], index) => [`[${index}]`, v])
  }
  
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as DIF.Definitions.DIFObject)
  }
  
  return []
}

defineExpose({
  searchQuery,
  normalizedSearchQuery,
  searchTokens,
  hasSearchQuery,
  expandedPointers,
})
</script>

<template>
  <!-- Full Screen PointerView -->
  <div 
    class="h-screen w-full flex flex-col bg-background"
    :class="props.class"
  >
    <Sidebar 
      collapsible="none"
      class="w-full h-full flex flex-col"
    >
      <SidebarContent class="gap-0 flex flex-col h-full overflow-hidden">
        <!-- Search Header (Fixed at top) -->
        <SidebarGroup class="py-0 shrink-0">
          <div class="p-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                v-model="searchQuery"
                type="text"
                :placeholder="props.searchPlaceholder"
                class="pl-9 bg-sidebar-accent"
                @input="handleSearchInput"
              />
            </div>
          </div>
        </SidebarGroup>

        <!-- Tree Structure (Scrollable with ScrollArea) -->
        <ScrollArea class="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <!-- 
                  Render pointers from the Map
                  Display top-level pointers with expand/collapse functionality
                -->
                <div
                  v-for="[pointerId, value] in filteredPointers"
                  :key="pointerId"
                >
                  <!-- Top-level pointer -->
                  <div
                    class="flex items-center gap-1 p-2 hover:bg-accent cursor-pointer rounded-md"
                    :class="{ 'bg-accent': selectedPointerId === pointerId }"
                    @click="handlePointerClick(pointerId, value)"
                  >
                    <!-- Expand/Collapse chevron for expandable items -->
                    <button
                      v-if="isExpandable(value)"
                      @click="togglePointer(pointerId, $event)"
                      class="shrink-0 hover:bg-accent-foreground/10 rounded p-0.5"
                    >
                      <ChevronRight
                        v-if="!isExpanded(pointerId)"
                        class="h-4 w-4"
                      />
                      <ChevronDown
                        v-else
                        class="h-4 w-4"
                      />
                    </button>
                    <div v-else class="w-5 shrink-0"></div>
                    
                    <!-- Pointer ID and preview -->
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <span class="font-mono text-sm text-primary">{{ pointerId }}</span>
                      <span class="text-xs text-muted-foreground">{{ getTypeName(value) }}</span>
                      <span class="text-sm text-foreground/70 truncate">{{ getValuePreview(value) }}</span>
                    </div>
                  </div>
                  
                  <!-- Children (when expanded) -->
                  <div
                    v-if="isExpanded(pointerId) && isExpandable(value)"
                    class="ml-6 border-l border-border pl-2"
                  >
                    <div
                      v-for="[childKey, childValue] in getChildren(value)"
                      :key="childKey"
                      class="p-2 hover:bg-accent/50 cursor-pointer rounded-md"
                    >
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">{{ childKey }}:</span>
                        <span class="text-xs text-muted-foreground">{{ getTypeName(childValue) }}</span>
                        <span class="text-sm text-foreground/70 truncate">{{ getValuePreview(childValue) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty state when no results -->
                <div 
                  v-if="hasSearchQuery && filteredPointers.size === 0"
                  class="p-4 text-sm text-muted-foreground text-center"
                >
                  No results found for "{{ searchQuery }}"
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  </div>
</template>