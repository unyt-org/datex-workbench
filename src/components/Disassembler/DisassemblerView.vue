<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
import type { InstructionTree, FlatInstruction } from '@/types/disassembler'
import InstructionTreeNode from './InstructionTreeNode.vue'
import InstructionFlatItem from './InstructionFlatItem.vue'
import { GitFork, List, UnfoldVertical, FoldVertical } from 'lucide-vue-next'

type ViewMode = 'tree' | 'flat'

defineProps<{
  /** Raw DXB body bytes to disassemble */
  dxb: Uint8Array
}>()

const viewMode = ref<ViewMode>('tree')
const showNested = ref(true)

// ─── Disassembly ────────────────────────────────────────────
// TODO: Replace mock data with actual runtime calls once available:
//   const [treeData, treeError] = Datex.Runtime.disassembleDXBTree(props.dxb)
//   const [flatData, flatError] = Datex.Runtime.disassembleDXBFlat(props.dxb)

const treeData = ref<InstructionTree | null>(null)
const treeError = ref<string | null>(null)
const flatData = shallowRef<FlatInstruction[] | null>(null)
const flatError = ref<string | null>(null)

// Mock data for development — remove when wiring up real runtime
import { MOCK_TREE, MOCK_FLAT } from '@/Mocks/disassemblerMocks'
treeData.value = MOCK_TREE[0]
treeError.value = MOCK_TREE[1]
flatData.value = MOCK_FLAT[0]
flatError.value = MOCK_FLAT[1]

const error = computed(() =>
  viewMode.value === 'tree' ? treeError.value : flatError.value
)
</script>

<template>
  <div class="flex flex-col">
    <!-- Controls bar -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/60">
      <span class="text-xs font-mono font-semibold tracking-wide text-foreground">
        DISASSEMBLY
      </span>

      <div class="flex items-center gap-1.5">
        <!-- Tree / Flat toggle -->
        <button
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150"
          :class="viewMode === 'tree'
            ? 'text-foreground border-foreground/30 bg-foreground/5'
            : 'text-gray-500 border-gray-700/50 bg-transparent hover:text-gray-700 hover:border-gray-600'"
          @click="viewMode = 'tree'"
        >
          <GitFork class="size-3.5" />
          Tree
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150"
          :class="viewMode === 'flat'
            ? 'text-foreground border-foreground/30 bg-foreground/5'
            : 'text-gray-500 border-gray-700/50 bg-transparent hover:text-gray-700 hover:border-gray-600'"
          @click="viewMode = 'flat'"
        >
          <List class="size-3.5" />
          Flat
        </button>

        <!-- Separator -->
        <div class="w-px h-5 bg-gray-700/50 mx-1" />

        <!-- Nested toggle -->
        <button
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150"
          :class="showNested
            ? 'text-foreground border-foreground/30 bg-foreground/5'
            : 'text-gray-500 border-gray-700/50 bg-transparent hover:text-gray-700 hover:border-gray-600'"
          @click="showNested = !showNested"
        >
        <UnfoldVertical v-if="showNested" class="size-3.5" />
        <FoldVertical v-else class="size-3.5" />
          Nested
        </button>
      </div>
    </div>

    <!-- Instruction view -->
    <div class="p-4 overflow-y-auto max-h-96">
      <!-- Tree mode -->
      <template v-if="viewMode === 'tree' && treeData">
        <InstructionTreeNode
          :node="treeData"
          :show-nested="showNested"
        />
      </template>

      <!-- Flat mode -->
      <template v-else-if="viewMode === 'flat' && flatData">
        <InstructionFlatItem
          v-for="(inst, i) in flatData"
          :key="i"
          :instruction="inst"
          :show-nested="showNested"
        />
      </template>

      <!-- Empty state -->
      <div v-else class="text-gray-500 italic text-sm font-mono">
        No instructions to display
      </div>
    </div>

    <!-- Error banner -->
    <div
      v-if="error"
      class="mx-4 mb-3 px-3 py-2 rounded-md border text-sm font-mono bg-red-950/40 border-red-900/60 text-red-300"
    >
      ⚠ {{ error }}
    </div>
  </div>
</template>