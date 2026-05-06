<script setup lang="ts">
import { ref } from 'vue'
import TraceControls from '@/components/NetworkTrace/TraceControls.vue'
import TreeView from '@/views/TreeView.vue'
import type { NodeTree } from '@/types/NodeTree/node-tree'

const tree = ref<NodeTree | null>(null)

function onTraceResult(result: NodeTree) {
  tree.value = result
}
</script>

<template>
  <div class="flex h-full w-full flex-col">
    <TraceControls :current-tree="tree" @trace-result="onTraceResult" />
    <div v-if="!tree" class="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      Send a trace to visualize the network tree
    </div>
    <TreeView v-else :initial-tree="tree" :force-read-only="true" class="flex-1" />
  </div>
</template>