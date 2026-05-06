<script setup lang="ts">
import { ref } from 'vue'
import DatexBlockProtocolView from './DatexBlockProtocolView.vue'
import { Upload, Download, FileWarning } from 'lucide-vue-next'
import { parseStructure } from '@unyt/speck'
import { dxbDefinition } from './settings'

const blockData = ref<Uint8Array | null>(null)
const parseError = ref<string | null>(null)
const isDragging = ref(false)
const fileName = ref<string | null>(null)

async function loadFile(file: File) {
  parseError.value = null
  try {
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)
    if (data.length === 0) {
      parseError.value = 'File is empty'
      blockData.value = null
      return
    }
    parseStructure(dxbDefinition, data); // Try parsing to validate the file format
    blockData.value = data  
    fileName.value = file.name
  } catch (err) {
    parseError.value = err instanceof Error ? err.message : 'Failed to read file'
    blockData.value = null
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
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
  const blob = new Blob([blockData.value.buffer as ArrayBuffer], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.value ?? 'block.dxb'
  a.click()
  URL.revokeObjectURL(url)
}

async function loadExample() {
  parseError.value = null
  fileName.value = 'block.dxb'
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/unyt-org/datex-core/main/crates/datex-core/tests/structs/receivers/block.bin',
    )
    const buffer = await response.arrayBuffer()
    blockData.value = new Uint8Array(buffer)
  } catch {
    parseError.value = 'Failed to load example block'
  }
}
</script>

<template>
  <div class="flex h-full flex-col no-drag top-offset">
    <!-- Top bar — only when a block is loaded -->
    <div
      v-if="blockData || parseError"
      class="flex items-center gap-2 border-b border-border px-4 py-2"
    >
      <label
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-mono text-foreground hover:bg-muted transition"
      >
        <Upload class="size-3.5" />
        Open File
        <input
          type="file"
          accept=".dxb,.bin"
          class="hidden"
          @change="onFileSelect"
        />
      </label>

      <button
        :disabled="!blockData"
        class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-mono text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
        @click="saveBlock"
      >
        <Download class="size-3.5" />
        Save .dxb
      </button>

      <span v-if="fileName" class="ml-2 text-xs text-muted-foreground font-mono truncate">
        {{ fileName }}
      </span>
    </div>

    <!-- Drop zone / content area -->
    <div
      class="flex-1 relative min-h-0"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
    >
      <!-- Drag overlay -->
      <div
        v-if="isDragging"
        class="absolute pointer-events-none inset-0 z-50 flex items-center justify-center border-2 bg-blue-400/10 border-blue-500 border-dashed rounded-lg m-2"
      >

      </div>

      <!-- Error state -->
      <div
        v-if="parseError"
        class="flex flex-col items-center justify-center h-full gap-3 text-center"
      >
        <FileWarning class="size-10 text-red-400" />
        <div class="text-red-400 text-sm font-mono">{{ parseError }}</div>
      </div>

      <!-- Block viewer -->
      <DatexBlockProtocolView
        v-else-if="blockData"
        class="h-full"
        :blockData="blockData"
        :key="blockData.byteLength"
      />

      <!-- Empty state — centered drop area + button only -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-full gap-4"
      >
        <Upload class="size-12 text-muted-foreground" />
        <div class="text-muted-foreground text-sm font-mono">
          Drop a .dxb file here
        </div>
        <label
          class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-mono text-foreground hover:bg-muted transition"
        >
          <Upload class="size-4" />
          Open File
          <input
            type="file"
            accept=".dxb,.bin"
            class="hidden"
            @change="onFileSelect"
          />
        </label>

        <button
          class="text-xs text-muted-foreground hover:text-foreground underline font-mono"
          @click="loadExample"
        >
          Load example block
        </button>
      </div>
    </div>
  </div>
</template>
