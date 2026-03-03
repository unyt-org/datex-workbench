<script setup lang="ts">
import { File, Folder, FolderOpen, ChevronRight, ChevronDown, TriangleAlert } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ref, nextTick, computed, watch } from 'vue';
import type { FileTreeNode } from '@/types/FileTree';

// ── Types ──────────────────────────────────────────────────────────
export interface CreatingState {
  folderPath: string; // which folder is showing the inline input
  type: 'file' | 'folder'; // what kind of item is being created
}

// ── Props ──────────────────────────────────────────────────────────
interface Props {
  node: FileTreeNode;
  depth?: number;
  currentFile?: string;
  siblingNames?: string[];
  /** Centralized creation state from parent */
  creatingIn?: CreatingState | null;
  /** Path of the node currently being renamed */
  renamingPath?: string | null;
  /** Currently selected paths for multi-select */
  selectedPaths?: Set<string>;
  /** Paths in the internal clipboard */
  clipboardPaths?: string[];
  /** Clipboard operation mode */
  clipboardMode?: 'cut' | 'copy' | null;
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  siblingNames: () => [],
  creatingIn: null,
  renamingPath: null,
  selectedPaths: () => new Set<string>(),
  clipboardPaths: () => [],
  clipboardMode: null,
});

// ── Emits ──────────────────────────────────────────────────────────
const emit = defineEmits<{
  'item-click': [event: MouseEvent, node: FileTreeNode];
  'toggle-folder': [path: string];
  'context-menu': [event: MouseEvent, node: FileTreeNode];
  'confirm-create': [folderPath: string, name: string, type: 'file' | 'folder'];
  'cancel-create': [];
  'confirm-rename': [oldPath: string, newName: string];
  'cancel-rename': [];
  'delete-item': [path: string];
}>();

// ── Computed: is THIS node currently creating? ─────────────────────
const isCreating = computed(
  () => props.node.type === 'folder' && props.creatingIn?.folderPath === props.node.path,
);
const creatingType = computed(() => props.creatingIn?.type ?? 'file');

// ── Computed: is THIS node currently being renamed? ────────────────
const isRenaming = computed(() => props.renamingPath === props.node.path);

// ── Computed: selection & clipboard state ──────────────────────────
const isSelected = computed(() => props.selectedPaths.has(props.node.path));
const isCut = computed(
  () => props.clipboardMode === 'cut' && props.clipboardPaths.includes(props.node.path),
);

// ── Inline creation state ──────────────────────────────────────────
const newItemName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// Computed: names of children for duplicate check during creation
const childNames = computed(() =>
  (props.node.children || []).map((c) => c.name.toLowerCase()),
);
const isCreateDuplicate = computed(() => {
  const name = newItemName.value.trim().toLowerCase();
  if (!name) return false;
  return childNames.value.includes(name);
});

// ── Rename state ───────────────────────────────────────────────────
const renameValue = ref('');
const renameInputRef = ref<HTMLInputElement | null>(null);

const isRenameDuplicate = computed(() => {
  const name = renameValue.value.trim().toLowerCase();
  if (!name) return false;
  if (name === props.node.name.toLowerCase()) return false;
  return props.siblingNames.some((s) => s.toLowerCase() === name);
});

// ── Layout helpers ─────────────────────────────────────────────────
const paddingLeft = computed(() => `${props.depth * 16 + 8}px`);
const childPaddingLeft = computed(() => `${(props.depth + 1) * 16 + 8}px`);

// ── Event handlers ─────────────────────────────────────────────────
function handleClick(e: MouseEvent) {
  // Always emit the raw click for the parent to handle selection
  emit('item-click', e, props.node);

  // Toggle folder expansion on click (regardless of modifier)
  if (props.node.type === 'folder') {
    emit('toggle-folder', props.node.path);
  }
}

function handleContextMenu(e: MouseEvent) {
  e.preventDefault();
  emit('context-menu', e, props.node);
}

// ── Creation input lifecycle ───────────────────────────────────────
watch(isCreating, async (val) => {
  if (val) {
    newItemName.value = '';
    await nextTick();
    inputRef.value?.focus();
  }
});

let isConfirmingCreate = false;

function confirmCreate() {
  const name = newItemName.value.trim();
  if (!name || isCreateDuplicate.value) return;
  isConfirmingCreate = true;
  emit('confirm-create', props.node.path, name, creatingType.value);
  isConfirmingCreate = false;
}

function cancelCreate() {
  emit('cancel-create');
}

function handleCreateBlur() {
  if (!isConfirmingCreate) cancelCreate();
}

function handleCreateKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') confirmCreate();
  else if (e.key === 'Escape') cancelCreate();
}

// ── Rename input lifecycle ─────────────────────────────────────────
watch(isRenaming, async (val) => {
  if (val) {
    renameValue.value = props.node.name;
    await nextTick();
    renameInputRef.value?.focus();
    renameInputRef.value?.select();
  }
});

let isConfirmingRename = false;

function confirmRename() {
  const newName = renameValue.value.trim();
  if (!newName || isRenameDuplicate.value) return;
  if (newName === props.node.name) {
    cancelRename();
    return;
  }
  isConfirmingRename = true;
  emit('confirm-rename', props.node.path, newName);
  isConfirmingRename = false;
}

function cancelRename() {
  emit('cancel-rename');
}

function handleRenameBlur() {
  if (!isConfirmingRename) cancelRename();
}

function handleRenameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') confirmRename();
  else if (e.key === 'Escape') cancelRename();
}
</script>

<template>
  <div data-tree-item>
    <!-- Normal node row (displayed when NOT renaming this node) -->
    <div
      v-if="!isRenaming"
      :class="cn(
        'flex items-center gap-1 py-1 px-1 rounded-md text-sm cursor-pointer select-none transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : node.type === 'file' && node.path === currentFile
            ? 'bg-sidebar-accent/60 text-sidebar-accent-foreground'
            : 'text-sidebar-foreground',
        isCut && 'opacity-50'
      )"
      :style="{ paddingLeft }"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <!-- Chevron + icon for folders -->
      <template v-if="node.type === 'folder'">
        <ChevronDown v-if="node.isExpanded" class="w-4 h-4 flex-shrink-0 opacity-70" />
        <ChevronRight v-else class="w-4 h-4 flex-shrink-0 opacity-70" />
        <FolderOpen v-if="node.isExpanded" class="w-4 h-4 flex-shrink-0" />
        <Folder v-else class="w-4 h-4 flex-shrink-0" />
      </template>
      <template v-else>
        <span class="w-4 flex-shrink-0" />
        <File class="w-4 h-4 flex-shrink-0" />
      </template>
      <span class="truncate">{{ node.name }}</span>
    </div>

    <!-- Rename input (replaces node row when renaming this node) -->
    <div
      v-if="isRenaming"
      class="flex items-center gap-1 py-1 px-1"
      :style="{ paddingLeft }"
    >
      <template v-if="node.type === 'folder'">
        <ChevronRight class="w-4 h-4 flex-shrink-0 opacity-70" />
        <Folder class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
      </template>
      <template v-else>
        <span class="w-4 flex-shrink-0" />
        <File class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
      </template>
      <input
        ref="renameInputRef"
        v-model="renameValue"
        @keydown="handleRenameKeydown"
        @blur="handleRenameBlur"
        type="text"
        :class="cn(
          'flex-1 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-0.5 rounded outline-none focus:ring-1',
          isRenameDuplicate ? 'ring-1 ring-red-500 focus:ring-red-500' : 'focus:ring-primary'
        )"
      />
    </div>
    <!-- Rename duplicate error -->
    <div
      v-if="isRenaming && isRenameDuplicate"
      class="mx-3 mt-0.5 px-2 py-1 bg-[#5a1d1d] border border-red-500 rounded text-xs text-red-200 flex items-start gap-1.5"
      :style="{ marginLeft: paddingLeft }"
    >
      <TriangleAlert class="w-3.5 h-3.5 flex-shrink-0 text-red-400 mt-0.5" />
      <span>A file or folder <strong>{{ renameValue.trim() }}</strong> already exists. Please choose a different name.</span>
    </div>

    <!-- Children (only rendered for expanded folders) -->
    <template v-if="node.type === 'folder' && node.isExpanded">
      <!-- Inline creation input (first child position) -->
      <div v-if="isCreating" class="mt-0.5">
        <div
          class="flex items-center gap-1 py-1 px-1"
          :style="{ paddingLeft: childPaddingLeft }"
        >
          <span class="w-4 flex-shrink-0" />
          <File v-if="creatingType === 'file'" class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
          <Folder v-else class="w-4 h-4 flex-shrink-0 text-sidebar-foreground" />
          <input
            ref="inputRef"
            v-model="newItemName"
            @keydown="handleCreateKeydown"
            @blur="handleCreateBlur"
            type="text"
            :placeholder="creatingType === 'file' ? 'filename.ext' : 'foldername'"
            :class="cn(
              'flex-1 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-0.5 rounded outline-none focus:ring-1',
              isCreateDuplicate ? 'ring-1 ring-red-500 focus:ring-red-500' : 'focus:ring-primary'
            )"
          />
        </div>
        <!-- Duplicate error -->
        <div
          v-if="isCreateDuplicate"
          class="mx-3 mt-0.5 px-2 py-1 bg-[#5a1d1d] border border-red-500 rounded text-xs text-red-200 flex items-start gap-1.5"
          :style="{ marginLeft: childPaddingLeft }"
        >
          <TriangleAlert class="w-3.5 h-3.5 flex-shrink-0 text-red-400 mt-0.5" />
          <span>A file or folder <strong>{{ newItemName.trim() }}</strong> already exists. Please choose a different name.</span>
        </div>
      </div>

      <!-- Recursive children -->
      <FileTreeItem
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        :current-file="currentFile"
        :sibling-names="(node.children || []).map(c => c.name)"
        :creating-in="creatingIn"
        :renaming-path="renamingPath"
        :selected-paths="selectedPaths"
        :clipboard-paths="clipboardPaths"
        :clipboard-mode="clipboardMode"
        @item-click="(e, n) => emit('item-click', e, n)"
        @toggle-folder="emit('toggle-folder', $event)"
        @context-menu="(e, n) => emit('context-menu', e, n)"
        @confirm-create="(fp, name, type) => emit('confirm-create', fp, name, type)"
        @cancel-create="emit('cancel-create')"
        @confirm-rename="(op, nn) => emit('confirm-rename', op, nn)"
        @cancel-rename="emit('cancel-rename')"
        @delete-item="emit('delete-item', $event)"
      />
    </template>
  </div>
</template>
