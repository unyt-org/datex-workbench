<script setup lang="ts">
import { File, FilePlus, FolderPlus } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ref, nextTick } from 'vue';

// Props
interface Props {
  files: string[];
  currentFile?: string;
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  fileClick: [filename: string];
  createFile: [filename: string];
  createFolder: [foldername: string];
}>();

// State for creating new items
const isCreatingFile = ref(false);
const isCreatingFolder = ref(false);
const newItemName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// Handle file click
function handleFileClick(filename: string) {
  emit('fileClick', filename);
}

// Start creating new file
async function startCreateFile() {
  isCreatingFile.value = true;
  isCreatingFolder.value = false;
  newItemName.value = '';

  // Wait for DOM to update, then focus the input
  await nextTick();
  inputRef.value?.focus();
}

// Start creating new folder
async function startCreateFolder() {
  isCreatingFolder.value = true;
  isCreatingFile.value = false;
  newItemName.value = '';

  // Wait for DOM to update, then focus the input
  await nextTick();
  inputRef.value?.focus();
}

// Confirm creation
function confirmCreate() {
  if (!newItemName.value.trim()) return;

  if (isCreatingFile.value) {
    emit('createFile', newItemName.value);
  } else if (isCreatingFolder.value) {
    emit('createFolder', newItemName.value);
  }

  cancelCreate();
}

// Cancel creation
function cancelCreate() {
  isCreatingFile.value = false;
  isCreatingFolder.value = false;
  newItemName.value = '';
}

// Handle keyboard events
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    confirmCreate();
  } else if (e.key === 'Escape') {
    cancelCreate();
  }
}
</script>

<template>
  <div class="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
    <!-- Header with Actions -->
    <div class="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
      <h2 class="text-sm font-semibold text-sidebar-foreground">Files</h2>
      <div class="flex items-center gap-1">
        <button
          @click="startCreateFile"
          class="p-1.5 rounded hover:bg-sidebar-accent transition-colors"
          title="New File"
        >
          <FilePlus class="w-4 h-4 text-sidebar-foreground" />
        </button>
        <button
          @click="startCreateFolder"
          class="p-1.5 rounded hover:bg-sidebar-accent transition-colors"
          title="New Folder"
        >
          <FolderPlus class="w-4 h-4 text-sidebar-foreground" />
        </button>
      </div>
    </div>

    <!-- File List -->
    <div class="flex-1 overflow-y-auto p-2">
      <!-- New Item Input -->
      <div v-if="isCreatingFile || isCreatingFolder" class="mb-2">
        <div class="flex items-center gap-2 px-3 py-2">
          <File v-if="isCreatingFile" class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
          <FolderPlus v-else class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
          <input
            ref="inputRef"
            v-model="newItemName"
            @keydown="handleKeydown"
            @blur="cancelCreate"
            type="text"
            :placeholder="isCreatingFile ? 'filename.ext' : 'foldername'"
            class="flex-1 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-1 rounded outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Existing Files -->
      <button
        v-for="file in files"
        :key="file"
        @click="handleFileClick(file)"
        :class="cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          file === currentFile
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground'
        )"
      >
        <File class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ file }}</span>
      </button>
    </div>
  </div>
</template>
