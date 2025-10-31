<script setup>
import { reactive } from 'vue'
import Window from './Window.vue'

const props = defineProps({
  node: { type: Object, required: true },
})

// --- live corner drag state ---
const drag = reactive({
  active: false,
  corner: null,
  direction: null,
  startX: 0,
  startY: 0,
})

// --- live gutter drag state ---
const dragState = reactive({
  active: false,
  nearCollapse: null, // "left" | "right" | "top" | "bottom" | null
})

const startCornerDrag = (e, corner) => {
  if (props.node.type !== 'panel') return
  drag.active = true
  drag.corner = corner
  drag.startX = e.clientX
  drag.startY = e.clientY
  drag.direction = null

  window.addEventListener('mousemove', onCornerDrag)
  window.addEventListener('mouseup', stopCornerDrag)
}

const onCornerDrag = (e) => {
  if (!drag.active) return
  const dx = e.clientX - drag.startX
  const dy = e.clientY - drag.startY

  if (!drag.direction) {
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      drag.direction = Math.abs(dx) > Math.abs(dy) ? 'vertical' : 'horizontal'
      props.node.type = 'split'
      props.node.direction = drag.direction
      props.node.splitRatio = 0.5
      props.node.children = [
        reactive({ type: 'panel', label: 'Left/Top' }),
        reactive({ type: 'panel', label: 'Right/Bottom' }),
      ]
    } else return
  }

  const rect = document.body.getBoundingClientRect()
  if (props.node.direction === 'vertical') {
    const ratio = (e.clientX - rect.left) / rect.width
    props.node.splitRatio = Math.min(0.95, Math.max(0.05, ratio))
  } else {
    const ratio = (e.clientY - rect.top) / rect.height
    props.node.splitRatio = Math.min(0.95, Math.max(0.05, ratio))
  }
}

const stopCornerDrag = () => {
  drag.active = false
  drag.direction = null
  window.removeEventListener('mousemove', onCornerDrag)
  window.removeEventListener('mouseup', stopCornerDrag)
}

// --- handle gutter drag ---
const startGutterDrag = () => {
  dragState.active = true
  props.node.dragging = true
  dragState.nearCollapse = null
}

const stopGutterDrag = () => {
  if (!props.node.dragging) return

  props.node.dragging = false
  dragState.active = false

  if (dragState.nearCollapse) {
    if (dragState.nearCollapse === 'left' || dragState.nearCollapse === 'top') {
      collapseSplit(props.node, 1)
    } else {
      collapseSplit(props.node, 0)
    }
  }

  dragState.nearCollapse = null
}

const onGutterDrag = (e) => {
  if (!props.node.dragging) return
  const rect = e.currentTarget.getBoundingClientRect()
  let ratio

  if (props.node.direction === 'vertical') {
    ratio = (e.clientX - rect.left) / rect.width
  } else {
    ratio = (e.clientY - rect.top) / rect.height
  }

  ratio = Math.min(0.95, Math.max(0.05, ratio))
  props.node.splitRatio = ratio

  // mark which side is near collapse
  if (ratio <= 0.08) {
    dragState.nearCollapse = props.node.direction === 'vertical' ? 'left' : 'top'
  } else if (ratio >= 0.92) {
    dragState.nearCollapse = props.node.direction === 'vertical' ? 'right' : 'bottom'
  } else {
    dragState.nearCollapse = null
  }
}

const collapseSplit = (splitNode, keepIndex) => {
  const keep = splitNode.children[keepIndex]

  if (keep.type === 'split') {
    splitNode.type = keep.type
    splitNode.direction = keep.direction
    splitNode.splitRatio = keep.splitRatio
    splitNode.children = keep.children
  } else {
    splitNode.type = 'panel'
    splitNode.label = keep.label || 'Collapsed Panel'
    delete splitNode.direction
    delete splitNode.splitRatio
    delete splitNode.children
  }

  splitNode.dragging = false
}
</script>

<template>
  <!-- PANEL -->
  <div
    v-if="node.type === 'panel'"
    class="w-full h-full relative bg-neutral-50 dark:bg-neutral-950 overflow-hidden transition-opacity"
  >
    <div class="absolute top-0 left-0 bg-gray text-xs px-2 py-1 rounded-br">
      {{ node.label || 'Panel' }}
    </div>

    <div class="w-full h-full flex items-center justify-center">
      <slot>{{ Date.now() }}</slot>
    </div>

    <!-- four draggable corners -->
    <div
      v-for="corner in ['top-left', 'top-right', 'bottom-left', 'bottom-right']"
      :key="corner"
      class="absolute opacity-100 hover:opacity-60 transition"
      :class="{
        'top-0 left-0 cursor-nw-resize': corner === 'top-left',
        'top-0 right-0 cursor-ne-resize': corner === 'top-right',
        'bottom-0 left-0 cursor-sw-resize': corner === 'bottom-left',
        'bottom-0 right-0 cursor-se-resize': corner === 'bottom-right',
      }"
      @mousedown="(e) => startCornerDrag(e, corner)"
    >
      <svg class="block w-4 h-4" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
        <path
          v-if="corner === 'top-left'"
          d="M0,8 A8,8 0 0 1 8,0 L0,0 Z"
          fill="currentColor"
          class="text-primary-foreground"
        />
        <path
          v-else-if="corner === 'top-right'"
          d="M0,0 A8,8 0 0 1 8,8 L8,0 Z"
          fill="currentColor"
          class="text-primary-foreground"
        />
        <path
          v-else-if="corner === 'bottom-left'"
          d="M0,0 A8,8 0 0 0 8,8 L0,8 Z"
          fill="currentColor"
          class="text-primary-foreground"
        />
        <path
          v-else
          d="M8,0 A8,8 0 0 1 0,8 L8,8 Z"
          fill="currentColor"
          class="text-primary-foreground"
        />
      </svg>
    </div>
  </div>

  <!-- SPLIT -->
  <div
    v-else
    class="w-full h-full select-none flex transition-all"
    :class="node.direction === 'vertical' ? 'flex-row' : 'flex-col'"
    @mousemove="onGutterDrag"
    @mouseup="stopGutterDrag"
  >
    <!-- first child -->
    <div
      class="flex-none transition-opacity duration-150"
      :class="{ 'opacity-30': dragState.nearCollapse === 'left' || dragState.nearCollapse === 'top' }"
      :style="{ flexBasis: `${node.splitRatio * 100}%` }"
    >
      <Window :node="node.children[0]" />
    </div>

    <!-- gutter -->
    <div
      :class="[
        node.direction === 'vertical'
          ? 'cursor-col-resize w-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-l-md'
          : 'cursor-row-resize h-1 hover:bg-neutral-700',
      ]"
      @mousedown="startGutterDrag"
    ></div>

    <!-- second child -->
    <div
      class="flex-auto transition-opacity duration-150"
      :class="{ 'opacity-30': dragState.nearCollapse === 'right' || dragState.nearCollapse === 'bottom' }"
    >
      <Window :node="node.children[1]" />
    </div>
  </div>
</template>
