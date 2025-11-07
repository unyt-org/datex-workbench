<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Settings, Filter } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import PointerTreeItem from './PointerTreeItem.vue'
import type { DIF } from '@/lib/runtime'

// Props interface
interface PointerViewProps {
  class?: HTMLAttributes['class']
  pointers: Map<string, DIF.Definitions.DIFContainer>
  searchPlaceholder?: string
}

// Define props with defaults
const props = withDefaults(defineProps<PointerViewProps>(), {
  searchPlaceholder: 'Search...',
})

// Emits to communicate with parent
const emit = defineEmits<{
  'pointer-click': [pointerId: string, value: DIF.Definitions.DIFContainer]
  'pointer-expand': [pointerId: string, expanded: boolean]
}>()

// State
const searchQuery = ref('')
const expandedPointers = ref<Set<string>>(new Set())
const showFullPointerIds = ref(false)
const showDataTypes = ref(false)
const showIndices = ref(true)

// Format pointer ID based on display mode
function formatPointerId(pointerId: string): string {
  if (showFullPointerIds.value) {
    return pointerId
  }
  
  const numericPart = pointerId.slice(1)
  
  if (numericPart.length > 4) {
    const lastFour = numericPart.slice(-4)
    return `$${lastFour}`
  }
  
  return pointerId
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
}
</script>

<template>
  <!-- Full Screen PointerView -->
  <div 
    class="h-screen w-full flex flex-col bg-background"
    :class="props.class"
  >
    <!-- Search Header (Fixed at top) -->
    <div class="border-b shrink-0">
      <div class="p-4">
        <div class="flex items-center gap-2">
          <!-- Settings Popover -->
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                title="Display Settings"
              >
                <Settings class="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80" align="start">
              <div class="space-y-4">
                <div class="space-y-2">
                  <h4 class="font-medium leading-none">Display Settings</h4>
                  <p class="text-sm text-muted-foreground">
                    Customize how pointers are displayed
                  </p>
                </div>
                
                <div class="space-y-4">
                  <!-- Show Full IDs Toggle -->
                  <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-col space-y-1 flex-1">
                      <span class="font-medium">Full Pointer IDs</span>
                      <span class="text-sm font-normal text-muted-foreground">
                        Show complete pointer identifiers
                      </span>
                    </div>
                    <Switch v-model="showFullPointerIds" />
                  </div>

                  <!-- Show Data Types Toggle -->
                  <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-col space-y-1 flex-1">
                      <span class="font-medium">Data Types</span>
                      <span class="text-sm font-normal text-muted-foreground">
                        Display type annotations before values
                      </span>
                    </div>
                    <Switch v-model="showDataTypes" />
                  </div>

                  <!-- Show Indices Toggle -->
                  <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-col space-y-1 flex-1">
                      <span class="font-medium">Keys & Indices</span>
                      <span class="text-sm font-normal text-muted-foreground">
                        Show object keys and array indices
                      </span>
                    </div>
                    <Switch v-model="showIndices" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <!-- Search Input -->
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              v-model="searchQuery"
              type="text"
              :placeholder="props.searchPlaceholder"
              class="pl-9"
            />
          </div>

          <!-- Filter Button with Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                size="icon"
              >
                <Filter class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" class="w-48">
              <!-- Filter content will be implemented later -->
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Tree Structure (Scrollable) -->
    <ScrollArea class="flex-1">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <PointerTreeItem
              v-for="[pointerId, value] in props.pointers"
              :key="pointerId"
              :node-id="pointerId"
              :label="formatPointerId(pointerId)"
              :full-label="pointerId"
              :value="value"
              :expanded-nodes="expandedPointers"
              :show-full-ids="showFullPointerIds"
              :show-data-types="showDataTypes"
              :show-indices="showIndices"
              @node-click="handlePointerClick"
              @node-toggle="togglePointer"
            />
            
            <!-- Empty state -->
            <div 
              v-if="props.pointers.size === 0"
              class="p-4 text-sm text-muted-foreground text-center"
            >
              No pointers available
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </ScrollArea>
  </div>
</template>