<script setup lang="ts">
import { reactive, toRaw } from 'vue'
import Window from './Window.vue'
import { getNewPanelId } from "@/utils/idPanelGenerator.ts";
import WindowGeneralView from "@/views/WindowGeneralView.vue";
import { useLayoutTree } from "@/composable/useLayoutTree.ts";


const props = defineProps({
  node: {type: Object, required: true},
})

const cloneNodeWithNewId = (node) => {
  const raw = toRaw(node)
  const clone = {
    ...raw,
    id: getNewPanelId(),
  }

  if (clone.children) {
    clone.children = clone.children.map((c) => cloneNodeWithNewId(c))
  }

  return reactive(clone)
}

const dropPreview = reactive({
  active: false,
  area: null, // 'top' | 'bottom' | 'left' | 'right' | 'center'
  mode: 'insert', // or 'replace'
  x: 0,
  y: 0,
})

// --- live corner drag state ---
const cornerDrag = reactive({
  active: false,
  corner: null,
  direction: "",
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
  cornerDrag.active = true
  cornerDrag.corner = corner
  cornerDrag.startX = e.clientX
  cornerDrag.startY = e.clientY
  cornerDrag.direction = null

  window.addEventListener('mousemove', onCornerDrag)
  window.addEventListener('mouseup', stopCornerDrag)
}

const onCornerDrag = (e) => {
  if (!cornerDrag.active) return
  const dx = e.clientX - cornerDrag.startX
  const dy = e.clientY - cornerDrag.startY

  if (!cornerDrag.direction) {
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      cornerDrag.direction = Math.abs(dx) > Math.abs(dy) ? 'vertical' : 'horizontal'
      props.node.type = 'split'
      props.node.direction = cornerDrag.direction
      props.node.splitRatio = 0.5

      let id1 = getNewPanelId();
      let id2 = getNewPanelId();

      props.node.children = [reactive({
        type: 'panel',
        id: id1,
        label: id1,
        data: structuredClone(toRaw(props.node.data)),
      }), reactive({
        type: 'panel',
        id: id2,
        label: id2,
        data: structuredClone(toRaw(props.node.data)),
      })]
    } else return
  }

  const rect = document.body.getBoundingClientRect()
  const ratioToSplit = 0.1
  if (props.node.direction === 'vertical') {
    const ratio = (e.clientX - rect.left) / rect.width
    props.node.splitRatio = Math.min(1 - ratioToSplit, Math.max(ratioToSplit, ratio))
  } else { //horizontal
    const ratio = (e.clientY - rect.top) / rect.height
    props.node.splitRatio = Math.min(1 - ratioToSplit, Math.max(ratioToSplit, ratio))
  }
}

const stopCornerDrag = () => {
  cornerDrag.active = false
  cornerDrag.direction = null

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
    const keepIndex = dragState.nearCollapse === 'left' || dragState.nearCollapse === 'top' ? 1 : 0
    const nodeToKeep = props.node.children[keepIndex]
    collapseSplit(nodeToKeep)
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

const collapseSplit = (nodeToKeep) => {
  const parent = findParentById(nodeToKeep.id)
  if (!parent) return console.warn('Parent not found for collapse')

  const index = parent.children.findIndex(c => c.id === nodeToKeep.id)
  if (index === -1) return console.warn('Node to keep not found in parent children')

  parent.children[index] = reactive(structuredClone(toRaw(nodeToKeep)))

  if (parent.type === 'split' && parent.children.length === 1) {
    const single = parent.children[0]
    parent.type = single.type
    parent.label = single.label
    parent.data = single.data
    if (single.type === 'split') {
      parent.direction = single.direction
      parent.splitRatio = single.splitRatio
      parent.children = single.children
    } else {
      delete parent.direction
      delete parent.splitRatio
      delete parent.children
    }
  }
}

const chooseAreaForDrop = (x, y) => {
  const edge = 0.25
  const distTop = y
  const distBottom = 1 - y
  const distLeft = x
  const distRight = 1 - x
  const minDist = Math.min(distTop, distBottom, distLeft, distRight)

  if (minDist > edge) return 'center'
  if (minDist === distTop) return 'top'
  if (minDist === distBottom) return 'bottom'
  if (minDist === distLeft) return 'left'
  return 'right'
}

let dragCounter = 0

const onDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter++
  dropPreview.active = true
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) {
    dropPreview.active = false
    dragCounter = 0
  }
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height

  dropPreview.x = e.clientX
  dropPreview.y = e.clientY
  dropPreview.area = chooseAreaForDrop(x, y)
  dropPreview.mode = dropPreview.area === 'center' ? 'replace' : 'insert'
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  dropPreview.active = false

  // get source id (the dragged panel)
  const sourceId = e.dataTransfer?.getData('text/plain')
  if (!sourceId) return

  const area = dropPreview.area
  const mode = dropPreview.mode

  if (sourceId === props.node.id && mode === 'replace') return; // same node → ignore

  // Find the dragged node somewhere in the tree
  const sourceNode = findNodeById(useLayoutTree().layoutTree, sourceId)
  if (!sourceNode) return

  // --- Replace (center drop)
  if (mode === 'replace') {
    props.node.type = sourceNode.type
    props.node.label = sourceNode.label
    props.node.data = structuredClone(toRaw(sourceNode.data))
    props.node.id = sourceNode.id

    collapseSplit(sourceNode, 0)
    return
  }

  // --- Insert (split)
  const newSplit = {
    type: 'split',
    direction: area === 'left' || area === 'right' ? 'vertical' : 'horizontal',
    splitRatio: 0.5,
    children: []
  }

  // left/top means dragged panel first, then target panel
  if (area === 'left' || area === 'top') {
    newSplit.children = [
      cloneNodeWithNewId(sourceNode),
      cloneNodeWithNewId(props.node),
    ]
  } else {
    newSplit.children = [
      cloneNodeWithNewId(props.node),
      cloneNodeWithNewId(sourceNode),
    ]
  }

  // Replace this node with the split
  Object.assign(props.node, newSplit)
}

const findNodeParent = (node, id) => {
  if (!node || !node.children) return null

  for (const child of node.children) {
    if (child.id === id) return node

    const found = findNodeParent(child, id)
    if (found) return found
  }

  return null
}
const findParentById = (id) => {
  const { layoutTree } = useLayoutTree()
  return findNodeParent(layoutTree, id)
}
const findNodeById = (node, id) => {
  if (!node) return null
  if (node.id === id) return node
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  console.error('Node not found:', id)
  return null
}

</script>

<template>
  <!-- PANEL -->
  <div
    v-if="node.type === 'panel'"
    class="w-full h-full relative bg-neutral-50 dark:bg-neutral-950 overflow-hidden transition-opacity"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div
      class="absolute top-0 left-0 right-0 h-6 flex items-center justify-between
         bg-neutral-200/70 dark:bg-neutral-800/70
         backdrop-blur-sm border-b border-neutral-300/50
         text-xs text-neutral-700 dark:text-neutral-300
         px-2 select-none cursor-grab active:cursor-grabbing"
      draggable="true"
      @dragstart="(e) => {
    e.dataTransfer?.setData('text/plain', node.id || 'panel')
  }"
    >
      <div class="flex items-center gap-1">
        <svg
          class="w-3 h-3 opacity-70"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="5" cy="10" r="2"/>
          <circle cx="10" cy="10" r="2"/>
          <circle cx="15" cy="10" r="2"/>
        </svg>
        <span>{{ node.label || 'Panel' }}</span>
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
        {{ dropPreview.mode === 'insert' ? 'Insert' : 'Replace' }}
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
        {{ node.data?.text || '— no text —' }} <br/>
        {{ node.data?.date || '— no date —' }}
      </div>
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
      <Window :node="node.children[0]"/>
    </div>

    <!-- gutter -->
    <div
      :class="[
        node.direction === 'vertical'
          ? 'cursor-col-resize w-1 m-1 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded'
          : 'cursor-row-resize h-1 m-1 bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded',
      ]"
      @mousedown="startGutterDrag"
    ></div>

    <!-- second child -->
    <div
      class="flex-auto transition-opacity duration-150"
      :class="{ 'opacity-30': dragState.nearCollapse === 'right' || dragState.nearCollapse === 'bottom' }"
    >
      <Window :node="node.children[1]"/>
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
