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
import TreeNode from './TreeNode.vue'
import type { PointerNode } from '@/types/pointer'

// Props interface
interface PointerViewProps {
  class?: HTMLAttributes['class']
  pointers: PointerNode[]
  selectedPointerId?: string | null
  searchPlaceholder?: string
  defaultExpanded?: boolean
}

// Define props with defaults
const props = withDefaults(defineProps<PointerViewProps>(), {
  searchPlaceholder: 'Search...',
  defaultExpanded: false,
  pointers: () => [],
})


// Emits to communicate with parent
const emit = defineEmits<{
  'node-click': [node: PointerNode]
  'node-expand': [nodeId: string, expanded: boolean]
  'search': [query: string]
  'update:selectedPointerId': [id: string | null]
}>()



// State
const searchQuery = ref('')
const expandedNodes = ref<Set<string>>(new Set())

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
 * Recursively filters tree nodes based on search query
 * A node is included if:
 * 1. Its label matches the search
 * 2. Any of its children match the search
 */
function filterNodes(nodes: PointerNode[]): PointerNode[] {
  if (!hasSearchQuery.value) {
    return nodes // No search query, return all nodes
  }

  return nodes.reduce((filtered: PointerNode[], node) => {
    // Check if this node's label matches any search token
    const labelLower = node.label.toLowerCase()
    const nodeMatches = searchTokens.value.some(token => 
      labelLower.includes(token)
    )

    // Recursively filter children
    const filteredChildren = node.children 
      ? filterNodes(node.children) 
      : []

    // Include this node if:
    // - The node itself matches, OR
    // - Any of its children match
    if (nodeMatches || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      })
    }

    return filtered
  }, [])
}

/**
 * Filtered pointers based on search query
 * Auto-expands matching nodes when searching
 */
const filteredPointers = computed(() => {
  const filtered = filterNodes(props.pointers)
  
  // Auto-expand all nodes when searching to show matches
  if (hasSearchQuery.value && filtered.length > 0) {
    const expandAll = (nodes: PointerNode[]) => {
      nodes.forEach(node => {
        expandedNodes.value.add(node.id)
        if (node.children) {
          expandAll(node.children)
        }
      })
    }
    expandAll(filtered)
  }
  
  return filtered
})

// Search handler - emits to parent for external state management if needed
function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  emit('search', target.value)
}

// Toggle node expansion
function toggleNode(nodeId: string) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
    emit('node-expand', nodeId, false)
  } else {
    expandedNodes.value.add(nodeId)
    emit('node-expand', nodeId, true)
  }
}

// Handle node click
function handleNodeClick(node: PointerNode) {
  emit('node-click', node)
  emit('update:selectedPointerId', node.id)
}

// Check if node is expanded
function isExpanded(nodeId: string): boolean {
  return expandedNodes.value.has(nodeId)
}

defineExpose({
  searchQuery,
  normalizedSearchQuery,
  searchTokens,
  hasSearchQuery,
  expandedNodes,
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
                  Render filtered pointers based on search query
                  TreeNode will handle rendering all nested children automatically!
                -->
                <TreeNode
                  v-for="pointer in filteredPointers"
                  :key="pointer.id"
                  :node="pointer"
                  :level="0"
                  :selected-node-id="selectedPointerId"
                  :expanded-nodes="expandedNodes"
                  @toggle="toggleNode"
                  @click="handleNodeClick"
                />
                
                <!-- Empty state when no results -->
                <div 
                  v-if="hasSearchQuery && filteredPointers.length === 0"
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