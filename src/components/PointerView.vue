<script setup lang="ts">
import { computed, ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'

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
})


// Emits to communcate with parent
const emit = defineEmits<{
  'node-click': [node: PointerNode]
  'node-expand': [nodeId: string, expanded: boolean]
  'search': [query: string]
  'update:selectedPointerId': [id: string | null]
}>()



// State
const searchQuery = ref('')
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

defineExpose({
  searchQuery,
  normalizedSearchQuery,
  searchTokens,
  hasSearchQuery,
})
// TODO: Implement tree expansion logic
// TODO: Implement observer for view updates
</script>

<template>
  <div 
    class="pointer-view flex flex-col h-full bg-background"
    :class="props.class"
  >
    <!-- Search Field with Icon -->
    <div class="p-4 border-b border-border">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          v-model="searchQuery"
          type="text"
          :placeholder="props.searchPlaceholder"
          class="pl-9"
          @input="handleSearchInput"
        />
      </div>
    </div>

    <!-- TODO: Add expandable tree with shadcn/ui components -->
    <!-- TODO: Add scrollable container -->
    <div class="text-sm text-muted-foreground p-4">
      Search query: {{ searchQuery }}
      <br />
      Normalized: {{ normalizedSearchQuery }}
      <br />
      Tokens: {{ searchTokens.join(', ') }}
    </div>
  </div>
</template>