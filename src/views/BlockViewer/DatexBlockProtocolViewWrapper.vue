<script setup lang="ts">
import { ref } from 'vue'
import DatexBlockProtocolView from './DatexBlockProtocolView.vue'
import { Upload, Download, FileWarning } from 'lucide-vue-next'
import { parseStructure } from '@unyt/speck'
import { dxbDefinition } from '@/views/BlockViewer/settings'

const blockData = ref<Uint8Array | null>(null)
const parseError = ref<string | null>(null)
const isDragging = ref(false)
const fileName = ref<string | null>(null)

  async function loadFile(file: File) {
  parseError.value = null
  fileName.value = file.name
  try {
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)
    if (data.length === 0) {
      parseError.value = 'File is empty'
      blockData.value = null
      return
    }
    blockData.value = data
  } catch (err) {
    parseError.value = err instanceof Error ? err.message : 'Failed to read file'
    blockData.value = null
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  console.log('drop event', event.dataTransfer?.files)
  const file = event.dataTransfer?.files[0]
  if (file) loadFile(file)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) loadFile(file)
  input.value = ''
}

function saveBlock() {
  if (!blockData.value) return
  const blob = new Blob([blockData.value], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.value ?? 'block.bin'
  a.click()
  URL.revokeObjectURL(url)
}

// Load default example block
async function loadExample() {
  parseError.value = null
  fileName.value = 'block.bin (example)'
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/unyt-org/datex-core/main/crates/datex-core/tests/structs/receivers/block.bin',
    )
    console.log('fetch status:', response.status, response.ok)
    const buffer = await response.arrayBuffer()
    const data = new Uint8Array(buffer)
    console.log('data:', data.slice(0, 10))
    parseStructure(dxbDefinition, data)
    blockData.value = data
  } catch (err) {
  parseError.value = err instanceof Error ? err.message : 'Failed to read file'
}
}

loadExample()
</script>

<template>
  <div class="flex h-full flex-col no-drag top-offset">
    <!-- Top bar -->
    <div class="flex items-center gap-2 border-b border-border px-4 py-2">
      <!-- File select button -->
      <label
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-mono text-foreground hover:bg-muted transition"
      >
        <Upload class="size-3.5" />
        Open File
        <input
          type="file"
          class="hidden"
          @change="onFileSelect"
        />
      </label>

      <!-- Save button -->
      <button
        :disabled="!blockData"
        class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-mono text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
        @click="saveBlock"
      >
        <Download class="size-3.5" />
        Save .bin
      </button>

      <!-- File name -->
      <span v-if="fileName" class="ml-2 text-xs text-muted-foreground font-mono truncate">
        {{ fileName }}
      </span>
    </div>

    <!-- Drop zone / content area -->
    <div
      class="flex-1 relative"
      @drop.prevent="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <!-- Drag overlay -->
      <div
        v-if="isDragging"
        class="absolute inset-0 z-50 flex items-center justify-center bg-background/80 border-2 border-dashed border-muted-foreground/40 rounded-lg m-2"
      >
        <div class="text-muted-foreground text-sm font-mono flex flex-col items-center gap-2">
          <Upload class="size-8" />
          Drop .bin file here
        </div>
      </div>

      <!-- Error state -->
      <div
        v-if="parseError"
        class="flex flex-col items-center justify-center h-full gap-3 text-center"
      >
        <FileWarning class="size-10 text-red-400" />
        <div class="text-red-400 text-sm font-mono">{{ parseError }}</div>
        <button
          class="text-xs text-muted-foreground hover:text-foreground underline font-mono"
          @click="loadExample"
        >
          Load example block
        </button>
      </div>

      <!-- Block viewer -->
      <DatexBlockProtocolView
        v-else-if="blockData"
        :blockData="blockData"
        :key="blockData.byteLength"
      />

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground text-sm font-mono"
      >
        <Upload class="size-8" />
        <div>Drop a .bin file here or click "Open File"</div>
      </div>
    </div>
  </div>
</template>
