<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
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
  SidebarRail,
} from '@/components/ui/sidebar'
import TreeNode from './TreeNode.vue'

interface PointerNode {
  id: string
  label: string
  path: string
  type?: string
  valuePreview?: string
  children?: PointerNode[]
}

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

// ========================================
// Resizable Sidebar Logic
// ========================================
const sidebarWidth = ref(300) // Initial width in pixels
const minWidth = 200 // Minimum width
const maxWidth = 600 // Maximum width
const isResizing = ref(false)
const resizeHandle = ref<HTMLElement | null>(null)

// Start resizing
function startResize(e: MouseEvent) {
  isResizing.value = true
  e.preventDefault()
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// Handle mouse move during resize
function handleResize(e: MouseEvent) {
  if (!isResizing.value) return
  
  // Calculate new width based on mouse position
  const newWidth = e.clientX
  
  // Clamp width between min and max
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth
  }
}

// Stop resizing
function stopResize() {
  isResizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Add event listeners on mount
onMounted(() => {
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
})

// Remove event listeners on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})

// Computed values
const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())
const searchTokens = computed(() =>
  normalizedSearchQuery.value ? normalizedSearchQuery.value.split(/\s+/) : []
)
const hasSearchQuery = computed(() => searchTokens.value.length > 0)

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
  <div 
    class="relative flex h-screen"
    :class="props.class"
  >
    <!-- Resizable Sidebar with Fixed Height -->
    <Sidebar 
      collapsible="none"
      :style="{ width: `${sidebarWidth}px` }"
      class="border-r border-border h-full flex flex-col"
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
                  Render each top-level pointer using the recursive TreeNode component
                  TreeNode will handle rendering all nested children automatically!
                -->
                <TreeNode
                  v-for="pointer in pointers"
                  :key="pointer.id"
                  :node="pointer"
                  :level="0"
                  :selected-node-id="selectedPointerId"
                  :expanded-nodes="expandedNodes"
                  @toggle="toggleNode"
                  @click="handleNodeClick"
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
    
    <!-- 
      Resize Handle 
      This is the draggable area on the right edge of the sidebar
    -->
    <div
      ref="resizeHandle"
      class="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 transition-colors z-10"
      :class="{ 'bg-primary/30': isResizing }"
      @mousedown="startResize"
    />
  </div>
</template>