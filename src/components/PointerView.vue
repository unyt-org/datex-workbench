<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import { usePointerPreferences } from '@/composables/usePointerPreferences';
import type { DIF } from '@unyt/datex';
import { Filter, Search, Settings } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';
import { computed, ref, watchEffect } from 'vue';
import PointerPreferences from './PointerPreferences.vue';
import PointerTreeItem from './PointerTreeItem.vue';

// Props interface
interface PointerViewProps {
  class?: HTMLAttributes['class'];
  pointers: Map<string, DIF.Definitions.DIFContainer>;
  searchPlaceholder?: string;
}

// Define props with defaults
const props = withDefaults(defineProps<PointerViewProps>(), {
  searchPlaceholder: 'Search...',
  visitedObjects: new WeakSet(),
});
console.log(props);
// Emits to communicate with parent
const emit = defineEmits<{
  'pointer-click': [pointerId: string, value: DIF.Definitions.DIFContainer];
  'pointer-expand': [pointerId: string, expanded: boolean];
}>();

// Use preferences composable
const { preferences } = usePointerPreferences();

// State
const searchQuery = ref('');
const expandedPointers = ref<Set<string>>(new Set());
const visitedObjects = new WeakSet(); // FIXME
// Computed property for current pointer IDs (cached and only recomputes when pointers Map changes)
const currentPointerIds = computed(() => new Set(props.pointers.keys()));

// Clean up expanded pointers when pointers change (reactive and efficient)
watchEffect(() => {
  const validIds = currentPointerIds.value;

  // Iterate over expandedPointers Set directly - O(m) where m = expanded nodes
  for (const pointerId of expandedPointers.value) {
    // Check if this is a root pointer or a child pointer
    const rootPointerId = pointerId.split('.')[0];

    // Remove if root pointer doesn't exist anymore - O(1) lookup in Set
    if (rootPointerId && !validIds.has(rootPointerId)) {
      expandedPointers.value.delete(pointerId);
    }
  }
});

// Clean up expanded children when parent node is collapsed or removed
function cleanupExpandedChildren(nodeId: string) {
  const childPrefix = `${nodeId}.`;

  // Iterate over Set directly (no array conversion) - O(m) where m = expanded nodes
  for (const id of expandedPointers.value) {
    if (id.startsWith(childPrefix)) {
      expandedPointers.value.delete(id);
    }
  }
}

// Format pointer ID based on display mode
function formatPointerId(pointerId: string): string {
  if (preferences.value.show_full_pointer_ids) {
    return pointerId;
  }

  const numericPart = pointerId.slice(1);

  if (numericPart.length > 4) {
    const lastFour = numericPart.slice(-4);
    return `$${lastFour}`;
  }

  return pointerId;
}

// Toggle pointer expansion
function togglePointer(pointerId: string) {
  if (expandedPointers.value.has(pointerId)) {
    expandedPointers.value.delete(pointerId);
    cleanupExpandedChildren(pointerId); // Clean up children when collapsing
    emit('pointer-expand', pointerId, false);
  } else {
    expandedPointers.value.add(pointerId);
    emit('pointer-expand', pointerId, true);
  }
}

// Handle pointer click
function handlePointerClick(pointerId: string, value: DIF.Definitions.DIFContainer) {
  emit('pointer-click', pointerId, value);
}

// Handle ID click - toggle full ID display preference
function handleIdClick(pointerId: string) {
  // Only toggle the preference for root-level pointers
  if (!pointerId.includes('.')) {
    preferences.value.show_full_pointer_ids = !preferences.value.show_full_pointer_ids;
  }
}
</script>

<template>
  <!-- Full Screen PointerView -->
  <div class="h-screen w-full flex flex-col bg-background" :class="props.class">
    <!-- Search Header (Fixed at top) -->
    <div class="border-b shrink-0">
      <div class="p-4">
        <div class="flex items-center gap-2">
          <!-- Settings Popover -->
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" size="icon" title="Display Preferences">
                <Settings class="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PointerPreferences />
          </Popover>

          <!-- Search Input -->
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
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
              <Button variant="outline" size="icon">
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
    <ScrollArea class="flex-1.5 mb-15">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <PointerTreeItem
              v-for="[pointerId, value] in props.pointers"
              :key="pointerId"
              :node-id="pointerId"
              :label="formatPointerId(pointerId)"
              :value="value"
              :expanded-nodes="expandedPointers"
              :visited-objects="visitedObjects"
              :show-full-ids="preferences.show_full_pointer_ids"
              :show-data-types="preferences.show_type_hints"
              :show-indices="preferences.show_array_indicies"
              :hide-type-hints-for-primitives="preferences.hide_type_hints_for_primitives"
              @node-click="handlePointerClick"
              @node-toggle="togglePointer"
              @id-click="handleIdClick"
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
