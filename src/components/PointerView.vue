<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
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
                  Render pointers using recursive PointerTreeItem component
                  This enables infinite depth expansion
                -->
                <PointerTreeItem
                  v-for="[pointerId, value] in filteredPointers"
                  :key="pointerId"
                  :node-id="pointerId"
                  :label="pointerId"
                  :value="value"
                  :expanded-nodes="expandedPointers"
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