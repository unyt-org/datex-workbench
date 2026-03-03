<script setup lang="ts">
import { FilePlus, FolderPlus, TriangleAlert, File as FileIcon, Folder } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ref, nextTick, computed } from 'vue';
import type { FileTreeNode } from '@/types/FileTree';
import type { CreatingState } from './FileTreeItem.vue';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileTreeItem from './FileTreeItem.vue';
import FolderContextMenu from './FolderContextMenu.vue';

// ── Props ──────────────────────────────────────────────────────────
interface Props {
  tree: FileTreeNode[];
  currentFile?: string;
}

const props = defineProps<Props>();

// ── Emits ──────────────────────────────────────────────────────────
const emit = defineEmits<{
  'file-click': [path: string];
  'toggle-folder': [path: string];
  'ensure-expand': [path: string];
  'create-file': [filename: string];
  'create-folder': [foldername: string];
  'create-file-in-folder': [folderPath: string, filename: string];
  'create-folder-in-folder': [folderPath: string, foldername: string];
  'rename-item': [oldPath: string, newName: string];
  'delete-item': [path: string];
}>();

// ── Centralized creation/rename state ──────────────────────────────
/** Which folder is showing an inline creation input, and what type */
const creatingIn = ref<CreatingState | null>(null);

/** Path of the node currently being renamed */
const renamingPath = ref<string | null>(null);

// ── Context menu state ─────────────────────────────────────────────
const contextMenu = ref<{ x: number; y: number; node: FileTreeNode } | null>(null);

// ── Root-level creation state ──────────────────────────────────────
const isCreatingAtRoot = ref(false);
const rootCreationType = ref<'file' | 'folder'>('file');
const newItemName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const rootNames = computed(() => props.tree.map((n) => n.name));
const isRootDuplicate = computed(() => {
  const name = newItemName.value.trim();
  if (!name) return false;
  return rootNames.value.some((n) => n.toLowerCase() === name.toLowerCase());
});

// ── Root-level creation actions ────────────────────────────────────
async function startCreateFileAtRoot() {
  isCreatingAtRoot.value = true;
  rootCreationType.value = 'file';
  newItemName.value = '';
  await nextTick();
  inputRef.value?.focus();
}

async function startCreateFolderAtRoot() {
  isCreatingAtRoot.value = true;
  rootCreationType.value = 'folder';
  newItemName.value = '';
  await nextTick();
  inputRef.value?.focus();
}

let isConfirmingRoot = false;

function confirmRootCreate() {
  const name = newItemName.value.trim();
  if (!name || isRootDuplicate.value) return;

  isConfirmingRoot = true;
  if (rootCreationType.value === 'file') {
    emit('create-file', name);
  } else {
    emit('create-folder', name);
  }
  cancelRootCreate();
  isConfirmingRoot = false;
}

function cancelRootCreate() {
  isCreatingAtRoot.value = false;
  newItemName.value = '';
}

function handleRootBlur() {
  if (!isConfirmingRoot) cancelRootCreate();
}

function handleRootKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') confirmRootCreate();
  else if (e.key === 'Escape') cancelRootCreate();
}

// ── Context menu handlers ──────────────────────────────────────────
function handleContextMenu(e: MouseEvent, node: FileTreeNode) {
  contextMenu.value = { x: e.clientX, y: e.clientY, node };
}

function closeContextMenu() {
  contextMenu.value = null;
}

function handleContextNewFile() {
  if (!contextMenu.value) return;
  const folderPath = contextMenu.value.node.path;
  closeContextMenu();
  // Ensure the folder is expanded (don't toggle — just expand if needed)
  emit('ensure-expand', folderPath);
  // Set centralized creation state — FileTreeItem will show the input
  nextTick(() => {
    creatingIn.value = { folderPath, type: 'file' };
  });
}

function handleContextNewFolder() {
  if (!contextMenu.value) return;
  const folderPath = contextMenu.value.node.path;
  closeContextMenu();
  emit('ensure-expand', folderPath);
  nextTick(() => {
    creatingIn.value = { folderPath, type: 'folder' };
  });
}

function handleContextRename() {
  if (!contextMenu.value) return;
  const path = contextMenu.value.node.path;
  closeContextMenu();
  renamingPath.value = path;
}

function handleContextDelete() {
  if (!contextMenu.value) return;
  emit('delete-item', contextMenu.value.node.path);
  closeContextMenu();
}

// ── Centralized creation confirm/cancel from FileTreeItem ──────────
function handleConfirmCreate(folderPath: string, name: string, type: 'file' | 'folder') {
  creatingIn.value = null;
  if (type === 'file') {
    emit('create-file-in-folder', folderPath, name);
  } else {
    emit('create-folder-in-folder', folderPath, name);
  }
}

function handleCancelCreate() {
  creatingIn.value = null;
}

// ── Centralized rename confirm/cancel from FileTreeItem ────────────
function handleConfirmRename(oldPath: string, newName: string) {
  renamingPath.value = null;
  emit('rename-item', oldPath, newName);
}

function handleCancelRename() {
  renamingPath.value = null;
}

// ── Toggle folder: ensure folder is expanded when creating inside ──
function handleToggleFolder(folderPath: string) {
  emit('toggle-folder', folderPath);
}
</script>

<template>
  <div class="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
    <!-- Header with Actions -->
    <div class="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
      <h2 class="text-sm font-semibold text-sidebar-foreground">Files</h2>
      <div class="flex items-center gap-1">
        <button
          @click="startCreateFileAtRoot"
          class="p-1.5 rounded hover:bg-sidebar-accent transition-colors"
          title="New File"
        >
          <FilePlus class="w-4 h-4 text-sidebar-foreground" />
        </button>
        <button
          @click="startCreateFolderAtRoot"
          class="p-1.5 rounded hover:bg-sidebar-accent transition-colors"
          title="New Folder"
        >
          <FolderPlus class="w-4 h-4 text-sidebar-foreground" />
        </button>
      </div>
    </div>

    <!-- File Tree -->
    <ScrollArea class="flex-1 min-h-0">
      <div class="p-2">
        <!-- Root-level New Item Input -->
        <div v-if="isCreatingAtRoot" class="mb-1">
          <div class="flex items-center gap-1 py-1 px-2">
            <span class="w-4 flex-shrink-0" />
            <FileIcon v-if="rootCreationType === 'file'" class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
            <Folder v-else class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
            <input
              ref="inputRef"
              v-model="newItemName"
              @keydown="handleRootKeydown"
              @blur="handleRootBlur"
              type="text"
              :placeholder="rootCreationType === 'file' ? 'filename.ext' : 'foldername'"
              :class="cn(
                'flex-1 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-0.5 rounded outline-none focus:ring-1',
                isRootDuplicate ? 'ring-1 ring-red-500 focus:ring-red-500' : 'focus:ring-primary'
              )"
            />
          </div>
          <div
            v-if="isRootDuplicate"
            class="mx-3 mt-0.5 px-2 py-1 bg-[#5a1d1d] border border-red-500 rounded text-xs text-red-200 flex items-start gap-1.5"
          >
            <TriangleAlert class="w-3.5 h-3.5 flex-shrink-0 text-red-400 mt-0.5" />
            <span>A file or folder <strong>{{ newItemName.trim() }}</strong> already exists. Please choose a different name.</span>
          </div>
        </div>

        <!-- Tree Items -->
        <FileTreeItem
          v-for="node in tree"
          :key="node.path"
          :node="node"
          :depth="0"
          :current-file="currentFile"
          :sibling-names="tree.map(n => n.name)"
          :creating-in="creatingIn"
          :renaming-path="renamingPath"
          @file-click="emit('file-click', $event)"
          @toggle-folder="handleToggleFolder"
          @context-menu="handleContextMenu"
          @confirm-create="handleConfirmCreate"
          @cancel-create="handleCancelCreate"
          @confirm-rename="handleConfirmRename"
          @cancel-rename="handleCancelRename"
          @delete-item="emit('delete-item', $event)"
        />
      </div>
    </ScrollArea>

    <!-- Context Menu -->
    <FolderContextMenu
      v-if="contextMenu"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :node-type="contextMenu.node.type"
      @new-file="handleContextNewFile"
      @new-folder="handleContextNewFolder"
      @rename="handleContextRename"
      @delete="handleContextDelete"
      @close="closeContextMenu"
    />
  </div>
</template>
