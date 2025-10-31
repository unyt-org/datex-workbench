<script setup>
import { reactive, ref } from 'vue'
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

// Start dragging from a corner
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

// While dragging, create / resize the split dynamically
const onCornerDrag = (e) => {
  if (!drag.active) return
  const dx = e.clientX - drag.startX
  const dy = e.clientY - drag.startY

  // detect direction
  if (!drag.direction) {
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      drag.direction = Math.abs(dx) > Math.abs(dy) ? 'vertical' : 'horizontal'

      // convert this node into a split
      props.node.type = 'split'
      props.node.direction = drag.direction
      props.node.splitRatio = 0.5
      props.node.children = [
        reactive({ type: 'panel', label: 'Left/Top' }),
        reactive({ type: 'panel', label: 'Right/Bottom' }),
      ]
    } else return
  }

  // adjust ratio live
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
const startGutterDrag = () => (props.node.dragging = true)
const stopGutterDrag = () => (props.node.dragging = false)
const onGutterDrag = (e) => {
  if (!props.node.dragging) return
  const rect = e.currentTarget.getBoundingClientRect()
  if (props.node.direction === 'vertical') {
    props.node.splitRatio = Math.min(0.95, Math.max(0.05, (e.clientX - rect.left) / rect.width))
  } else {
    props.node.splitRatio = Math.min(0.95, Math.max(0.05, (e.clientY - rect.top) / rect.height))
  }
}
</script>

<template>
  <!-- PANEL -->
  <div
    v-if="node.type === 'panel'"
    class="w-full h-full relative bg-neutral-50 dark:bg-neutral-950 overflow-hidden"
  >
    <!-- top-left label -->
    <div class="absolute top-0 left-0 bg-gray text-xs px-2 py-1 rounded-br">
      {{ node.label || 'Panel' }}
    </div>

    <!-- slot content -->
    <div class="w-full h-full flex items-center justify-center background-primary-100">
      <slot>Example content</slot>
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
        <!-- triangle shape -->
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
    class="w-full h-full select-none flex"
    :class="node.direction === 'vertical' ? 'flex-row' : 'flex-col'"
    @mousemove="onGutterDrag"
    @mouseup="stopGutterDrag"
  >
    <div class="flex-none" :style="{ flexBasis: `${node.splitRatio * 100}%` }">
      <Window :node="node.children[0]" />
    </div>

    <div
      :class="
        node.direction === 'vertical'
          ? 'cursor-col-resize w-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-l-md'
          : 'cursor-row-resize h-1 hover:background-primary-600'
      "
      @mousedown="startGutterDrag"
    ></div>

    <div class="flex-auto">
      <Window :node="node.children[1]" />
    </div>
  </div>
</template>
