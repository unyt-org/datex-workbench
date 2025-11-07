<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Hash } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import PointerTreeItem from './PointerTreeItem.vue'
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
const showFullPointerIds = ref(false)

// Computed values
const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())
const searchTokens = computed(() =>
  normalizedSearchQuery.value ? normalizedSearchQuery.value.split(/\s+/) : []
)
const hasSearchQuery = computed(() => searchTokens.value.length > 0)

// ========================================
// Pointer ID Formatting
// ========================================

/**
 * Format pointer ID based on display mode
 * Full: $0000000000000005
 * Short: $...005
 */
function formatPointerId(pointerId: string): string {
  if (showFullPointerIds.value) {
    return pointerId
  }
  
  // Extract the numeric part after $
  const numericPart = pointerId.slice(1) // Remove $
  
  // Show last 3 digits with ellipsis
  if (numericPart.length > 3) {
    const lastThree = numericPart.slice(-3)
    return `$...${lastThree}`
  }
  
  return pointerId
}

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
function togglePointer(pointerId: string) {
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

// Toggle pointer ID display mode
function togglePointerIdDisplay() {
  showFullPointerIds.value = !showFullPointerIds.value
}

defineExpose({
  searchQuery,
  normalizedSearchQuery,
  searchTokens,
  hasSearchQuery,
  expandedPointers,
  showFullPointerIds,
  formatPointerId,
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
            <div class="flex items-center gap-2">
              <!-- Toggle Pointer ID Display Button -->
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="outline"
                      size="icon"
                      @click="togglePointerIdDisplay"
                      :class="{ 'bg-accent': !showFullPointerIds }"
                    >
                      <Hash class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{{ showFullPointerIds ? 'Show short IDs' : 'Show full IDs' }}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <!-- Search Input -->
              <div class="relative flex-1">
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
          </div>
        </SidebarGroup>

        <!-- Tree Structure (Scrollable with ScrollArea) -->
        <ScrollArea class="flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <!-- 
                  Render pointers using recursive PointerTreeItem component
                  This enables infinite depth expansion
                -->
                <PointerTreeItem
                  v-for="[pointerId, value] in filteredPointers"
                  :key="pointerId"
                  :node-id="pointerId"
                  :label="formatPointerId(pointerId)"
                  :full-label="pointerId"
                  :value="value"
                  :expanded-nodes="expandedPointers"
                  :show-full-ids="showFullPointerIds"
                  @node-click="handlePointerClick"
                  @node-toggle="togglePointer"
                />
                
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