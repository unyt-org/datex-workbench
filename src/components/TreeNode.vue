<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from '@/components/ui/sidebar'
import type { PointerNode } from '@/types/pointer'

// ========================================
// Component Props
// ========================================
// These are the "inputs" this component receives from its parent
interface TreeNodeProps {
  node: PointerNode           // The data for THIS specific node
  level?: number              // How deep in the tree are we? (0 = root, 1 = child, 2 = grandchild)
  selectedNodeId?: string | null // Which node is currently selected?
  expandedNodes: Set<string>  // Which nodes are currently expanded?
}

// Define props with default values
const props = withDefaults(defineProps<TreeNodeProps>(), {
  level: 0,                   // Start at level 0 (root)
  selectedNodeId: null,
})

// ========================================
// Events This Component Can Emit
// ========================================
// Think of these as "messages" we send to the parent component
const emit = defineEmits<{
  'toggle': [nodeId: string]      // "user clicked the chevron!"
  'click': [node: PointerNode]    // "user clicked this node!"
}>()

// ========================================
// Computed Properties


const hasChildren = computed(() => {
  // Check if children array exists AND has items
  return props.node.children && props.node.children.length > 0
})

const isExpanded = computed(() => {
  // Check if this node's ID is in the expandedNodes Set
  return props.expandedNodes.has(props.node.id)
})

// Is THIS node currently selected?
const isSelected = computed(() => {
  return props.selectedNodeId === props.node.id
})

// Calculate indentation based on nesting level
// Level 0: 0px, Level 1: 16px, Level 2: 32px, etc.
const indentStyle = computed(() => {
  return {
    paddingLeft: `${props.level * 16}px`
  }
})

// ========================================
// vent Handlers
// ========================================

// When user clicks the chevron (expand/collapse arrow)
function handleToggle() {
  // Only toggle if this node has children
  if (hasChildren.value) {
    // Emit the toggle event to parent
    emit('toggle', props.node.id)
  }
}

// When user clicks the node itself
function handleClick() {
  emit('click', props.node)
}
</script>

<template>
  <!-- 
    This is ONE tree node
    It will render itself, then call itself again for each child
  -->
  <SidebarMenuItem>
    <!-- The visible button for this node -->
    <SidebarMenuButton
      class="gap-2"
      :class="{ 'bg-sidebar-accent': isSelected }"
      :style="indentStyle"
      @click="handleClick"
    >
      <!-- 
        ▶CHEVRON ICON
        Only shows if this node has children
        Changes from ChevronRight to ChevronDown when expanded
      -->
      <button
        v-if="hasChildren"
        class="flex items-center justify-center h-4 w-4 shrink-0"
        @click.stop="handleToggle"
      >
        <!-- 
          @click.stop prevents the click from bubbling up to the parent button
          So clicking chevron doesn't trigger handleClick()
        -->
        <ChevronRight
          v-if="!isExpanded"
          class="h-4 w-4 transition-transform text-muted-foreground"
        />
        <ChevronDown
          v-else
          class="h-4 w-4 transition-transform text-muted-foreground"
        />
      </button>
      
      <!-- 
        Empty space for alignment if no children
        This keeps nodes without children aligned with those that have them
      -->
      <div v-else class="w-4 shrink-0" />

      <!-- NODE LABEL -->
      <span class="flex-1 truncate text-sm">
        {{ node.label }}
      </span>
    </SidebarMenuButton>

    <!-- 
      RECURSIVE MAGIC HAPPENS HERE!
      If this node has children AND is expanded, render them
    -->
    <SidebarMenuSub v-if="hasChildren && isExpanded">
      <!-- 
        We're using <TreeNode> INSIDE the TreeNode component itself!
        
        For each child:
        1. Create a new TreeNode component
        2. Pass the child as the 'node' prop
        3. Increase the level by 1 (for indentation)
        4. Pass along the selectedNodeId and expandedNodes
        5. Forward any events that bubble up
        
        This creates a chain: TreeNode → TreeNode → TreeNode → ...
        As deep as the data goes!
      -->
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-node-id="selectedNodeId"
        :expanded-nodes="expandedNodes"
        @toggle="(id) => emit('toggle', id)"
        @click="(node) => emit('click', node)"
      />
    </SidebarMenuSub>
  </SidebarMenuItem>
</template>
