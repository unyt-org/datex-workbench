<script setup lang="ts">
import { reactive } from 'vue'
import Window from './Window.vue'
import { collapseSplit } from '@/composable/useLayoutTree.ts'
import {
  CollapseSide,
  type LayoutNode,
  NodeType,
  SplitDirection,
  type SplitNode,
} from '@/types/layout.ts'
import { useDragDrop } from '@/composable/useDragDrop.ts'

const props = defineProps<{ node: LayoutNode }>()

/** Tracks the currently active node for gutter dragging */
const gutterDragState = reactive<{ activeNodeId: string | null }>({ activeNodeId: null })

/**
 * Destructure reusable drag & drop logic for this node
 */
const { dragState, dropPreview, onDragEnter, onDragLeave, onDragOver, onDrop, DropMode } =
  useDragDrop(props.node)

/**
 * Starts dragging the gutter of a split node
 */
function startGutterDrag(): void {
  dragState.active = true
  gutterDragState.activeNodeId = props.node.id
  dragState.nearCollapse = CollapseSide.None
}

/**
 * Stops dragging the gutter and collapses a side if near a boundary
 */
function stopGutterDrag(): void {
  if (gutterDragState.activeNodeId !== props.node.id) return
  if (props.node.type !== NodeType.Split) return // only split nodes can be dragged

  gutterDragState.activeNodeId = null
  dragState.active = false

  if (dragState.nearCollapse) {
    collapseNearSide(props.node, dragState.nearCollapse)
  }

  dragState.nearCollapse = CollapseSide.None
}

/**
 * Updates a split ratio of the node during gutter drag
 * and determines which side is near collapse
 * @param e MouseEvent triggered on gutter movement
 */
function onGutterDrag(e: MouseEvent): void {
  if (gutterDragState.activeNodeId !== props.node.id) return

  const node = props.node as SplitNode
  const ratio = calculateSplitRatio(e, node)
  node.splitRatio = ratio
  dragState.nearCollapse = determineNearCollapse(ratio, node)
}

/**
 * Calculates the relative split ratio based on mouse position
 * @param e MouseEvent from gutter drag
 * @param node SplitNode being dragged
 * @returns number split ratio between 0.05 and 0.95
 */
function calculateSplitRatio(e: MouseEvent, node: SplitNode): number {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio =
    node.direction === SplitDirection.Vertical
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height

  // Clamp ratio to prevent collapse beyond the threshold
  return Math.min(0.95, Math.max(0.05, ratio))
}

/**
 * Determines which side of the split is near collapse
 * @param ratio Current split ratio (0..1)
 * @param node SplitNode being dragged
 * @returns CollapseSide if near a boundary, otherwise CollapseSide.None
 */
function determineNearCollapse(ratio: number, node: SplitNode): CollapseSide {
  if (ratio <= 0.15)
    return node.direction === SplitDirection.Vertical ? CollapseSide.Left : CollapseSide.Top
  if (ratio >= 0.85)
    return node.direction === SplitDirection.Vertical ? CollapseSide.Right : CollapseSide.Bottom
  return CollapseSide.None
}

/**
 * Collapses one side of a split node, keeping only the opposite side
 * @param node SplitNode to collapse
 * @param side Side to collapse (left/top or right/bottom)
 */
function collapseNearSide(node: SplitNode, side: CollapseSide): void {
  const keepIndex = side === CollapseSide.Left || side === CollapseSide.Top ? 1 : 0
  const nodeToKeep = node.children[keepIndex]
  if (!nodeToKeep) return
  collapseSplit(nodeToKeep)
}
</script>

<template>
  <!-- PANEL -->
  <div
    v-if="node.type === NodeType.Panel"
    class="w-full h-full relative bg-neutral-50 dark:bg-neutral-950 overflow-hidden transition-opacity"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div
      class="absolute top-0 left-0 right-0 h-6 flex items-center justify-between bg-neutral-200/70 dark:bg-neutral-800/70 backdrop-blur-sm border-b border-neutral-300/50 text-xs text-neutral-700 dark:text-neutral-300 px-2 select-none cursor-grab active:cursor-grabbing"
      draggable="true"
      @dragstart="
        (e) => {
          e.dataTransfer?.setData('text/plain', node.id)
        }
      "
    >
      <div class="flex items-center gap-1">
        <svg class="w-3 h-3 opacity-70" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="15" cy="10" r="2" />
        </svg>
        <span>{{ node.id }}</span>
      </div>
    </div>

    <!-- Drop preview overlay -->
    <div
      v-if="dropPreview.active"
      class="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/20 flex items-center justify-center transition-all"
    >
      <!-- Area highlight -->
      <div
        class="absolute inset-0 rounded-lg transition-all duration-150 border-2 border-primary/40 bg-primary/20"
        :class="{
          'clip-top': dropPreview.area === 'top',
          'clip-bottom': dropPreview.area === 'bottom',
          'clip-left': dropPreview.area === 'left',
          'clip-right': dropPreview.area === 'right',
          'clip-center': dropPreview.area === 'center',
        }"
      ></div>

      <div
        class="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs shadow-lg backdrop-blur-md"
      >
        {{ dropPreview.mode === DropMode.Insert ? 'Insert' : 'Replace' }}
      </div>
    </div>

    <div class="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      <input
        v-model="node.data.text"
        type="text"
        placeholder="Type text..."
        class="border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 w-full max-w-xs text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        v-model="node.data.date"
        type="date"
        class="border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 w-full max-w-xs text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div class="text-xs text-neutral-500 text-center mt-2">
        {{ node.data?.text || '— no text —' }} <br />
        {{ node.data?.date || '— no date —' }}
      </div>
    </div>
  </div>

  <!-- SPLIT -->
  <div
    v-else
    class="w-full h-full select-none flex transition-all"
    :class="node.direction === SplitDirection.Vertical ? 'flex-row' : 'flex-col'"
    @mousemove="onGutterDrag"
    @mouseup="stopGutterDrag"
  >
    <!-- first child -->
    <div
      class="flex-none transition-opacity duration-150"
      :class="{
        'opacity-30': dragState.nearCollapse === 'left' || dragState.nearCollapse === 'top',
      }"
      :style="{ flexBasis: `${node.splitRatio * 100}%` }"
    >
      <Window :node="node.children[0]" />
    </div>

    <!-- gutter -->
    <div
      :class="[
        node.direction === SplitDirection.Vertical
          ? 'cursor-col-resize w-1 m-1 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded'
          : 'cursor-row-resize h-1 m-1 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded',
      ]"
      @mousedown="startGutterDrag"
    ></div>

    <!-- second child -->
    <div
      class="flex-auto transition-opacity duration-150"
      :class="{
        'opacity-30': dragState.nearCollapse === 'right' || dragState.nearCollapse === 'bottom',
      }"
    >
      <Window :node="node.children[1]" />
    </div>
  </div>
</template>

<style scoped>
.clip-top {
  clip-path: inset(0 0 50% 0);
  transition: clip-path 0.3s ease-in-out;
}

.clip-bottom {
  clip-path: inset(50% 0 0 0);
  transition: clip-path 0.3s ease-in-out;
}

.clip-left {
  clip-path: inset(0 50% 0 0);
  transition: clip-path 0.3s ease-in-out;
}

.clip-right {
  clip-path: inset(0 0 0 50%);
  transition: clip-path 0.3s ease-in-out;
}

.clip-center {
  clip-path: inset(10% 10% 10% 10%);
  transition: clip-path 0.3s ease-in-out;
}
</style>
