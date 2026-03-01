<script setup lang="ts">
import { File, Folder, FilePlus, FolderPlus, TriangleAlert } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ref, nextTick, computed } from 'vue';

// Props
interface Props {
  files: string[];
  folders: string[];
  currentFile?: string;
}

const props = defineProps<Props>();

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

// Computed duplicate check — check against both files and folders
const isDuplicate = computed(() => {
  const name = newItemName.value.trim();
  if (!name) return false;
  const allNames = [...props.files, ...props.folders];
  return allNames.some(f => f.toLowerCase() === name.toLowerCase());
});

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

// Flag to prevent blur from canceling during confirmation
let isConfirming = false;

// Confirm creation
function confirmCreate() {
  const name = newItemName.value.trim();
  if (!name || isDuplicate.value) return;

  isConfirming = true;

  if (isCreatingFile.value) {
    emit('createFile', name);
  } else if (isCreatingFolder.value) {
    emit('createFolder', name);
  }

  cancelCreate();
  isConfirming = false;
}

// Cancel creation
function cancelCreate() {
  isCreatingFile.value = false;
  isCreatingFolder.value = false;
  newItemName.value = '';
}

// Handle blur - only cancel if not in the middle of confirming
function handleBlur() {
  if (!isConfirming) {
    cancelCreate();
  }
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
            @blur="handleBlur"
            type="text"
            :placeholder="isCreatingFile ? 'filename.ext' : 'foldername'"
            :class="cn(
              'flex-1 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-1 rounded outline-none focus:ring-1',
              isDuplicate ? 'ring-1 ring-red-500 focus:ring-red-500' : 'focus:ring-primary'
            )"
          />
        </div>
        <!-- Duplicate Error Message -->
        <div v-if="isDuplicate" class="mx-3 mt-1 px-2 py-1.5 bg-[#5a1d1d] border border-red-500 rounded text-xs text-red-200 flex items-start gap-1.5">
          <TriangleAlert class="w-3.5 h-3.5 flex-shrink-0 text-red-400 mt-0.5" />
          <span>A file or folder <strong>{{ newItemName.trim() }}</strong> already exists at this location. Please choose a different name.</span>
        </div>
      </div>

      <!-- Existing Folders -->
      <div
        v-for="folder in folders"
        :key="'folder-' + folder"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground"
      >
        <Folder class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ folder }}</span>
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
