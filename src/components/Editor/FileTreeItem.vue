<script setup lang="ts">
import {
    File,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    TriangleAlert,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ref, nextTick, computed, watch } from 'vue';
import type { FileTreeNode } from '@/types/FileTree';
import {
    draggedPath,
    dragOverPath,
    startFileDrag,
    endFileDrag,
    setFileDragOver,
    clearFileDragOver,
    isInvalidDrop,
    getFileDragPath,
} from '@/composable/useFileDragDrop';

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
    'item-dblclick': [event: MouseEvent, node: FileTreeNode];
    'toggle-folder': [path: string];
    'context-menu': [event: MouseEvent, node: FileTreeNode];
    'move-item': [srcPath: string, targetDir: string];
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

// ── Computed: drag state ───────────────────────────────────────────
const isDragging = computed(() => draggedPath.value === props.node.path);
const isDragOver = computed(
    () => props.node.type === 'folder' && dragOverPath.value === props.node.path,
);

// ── Inline creation state ──────────────────────────────────────────
const newItemName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// Computed: names of children for duplicate check during creation
const childNames = computed(() => (props.node.children || []).map((c) => c.name.toLowerCase()));
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
    emit('item-click', e, props.node);
    if (props.node.type === 'folder') {
        emit('toggle-folder', props.node.path);
    }
}

function handleDblClick(e: MouseEvent) {
    emit('item-dblclick', e, props.node);
}

function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    emit('context-menu', e, props.node);
}

// ── Drag & Drop handlers ───────────────────────────────────────────
function handleDragStart(e: DragEvent) {
    startFileDrag(props.node.path, e);
}

function handleDragEnd() {
    endFileDrag();
}

function handleDragOver(e: DragEvent) {
    if (props.node.type !== 'folder') return;
    if (!draggedPath.value) return;
    setFileDragOver(props.node.path, e);
}

function handleDragLeave() {
    if (dragOverPath.value === props.node.path) clearFileDragOver();
}

function handleDrop(e: DragEvent) {
    e.preventDefault();
    clearFileDragOver();

    const src = getFileDragPath(e);
    if (!src) return;

    // Determine target directory
    const targetDir =
        props.node.type === 'folder'
            ? props.node.path
            : props.node.path.substring(0, props.node.path.lastIndexOf('/')) || '/';

    if (isInvalidDrop(src, targetDir)) return;

    emit('move-item', src, targetDir);
    endFileDrag();
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
            :draggable="true"
            :class="
                cn(
                    'flex cursor-pointer items-center gap-1 rounded-md px-1 py-1 text-sm transition-colors select-none',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isSelected
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : node.type === 'file' && node.path === currentFile
                          ? 'bg-sidebar-accent/60 text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground',
                    isCut && 'opacity-50',
                    isDragging && 'opacity-30',
                    isDragOver && 'bg-blue-500/10 ring-1 ring-blue-500/60 ring-inset',
                )
            "
            :style="{ paddingLeft }"
            @click="handleClick"
            @dblclick="handleDblClick"
            @contextmenu="handleContextMenu"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
        >
            <!-- Chevron + icon for folders -->
            <template v-if="node.type === 'folder'">
                <ChevronDown v-if="node.isExpanded" class="h-4 w-4 flex-shrink-0 opacity-70" />
                <ChevronRight v-else class="h-4 w-4 flex-shrink-0 opacity-70" />
                <FolderOpen v-if="node.isExpanded" class="h-4 w-4 flex-shrink-0" />
                <Folder v-else class="h-4 w-4 flex-shrink-0" />
            </template>
            <template v-else>
                <span class="w-4 flex-shrink-0" />
                <File class="h-4 w-4 flex-shrink-0" />
            </template>
            <span class="truncate">{{ node.name }}</span>
        </div>

        <!-- Rename input (replaces node row when renaming this node) -->
        <div v-if="isRenaming" class="flex items-center gap-1 px-1 py-1" :style="{ paddingLeft }">
            <template v-if="node.type === 'folder'">
                <ChevronRight class="h-4 w-4 flex-shrink-0 opacity-70" />
                <Folder class="text-sidebar-foreground h-4 w-4 flex-shrink-0" />
            </template>
            <template v-else>
                <span class="w-4 flex-shrink-0" />
                <File class="text-sidebar-foreground h-4 w-4 flex-shrink-0" />
            </template>
            <input
                ref="renameInputRef"
                v-model="renameValue"
                @keydown="handleRenameKeydown"
                @blur="handleRenameBlur"
                type="text"
                :class="
                    cn(
                        'bg-sidebar-accent text-sidebar-accent-foreground flex-1 rounded px-2 py-0.5 text-sm outline-none focus:ring-1',
                        isRenameDuplicate
                            ? 'ring-1 ring-red-500 focus:ring-red-500'
                            : 'focus:ring-primary',
                    )
                "
            />
        </div>
        <!-- Rename duplicate error -->
        <div
            v-if="isRenaming && isRenameDuplicate"
            class="mx-3 mt-0.5 flex items-start gap-1.5 rounded border border-red-500 bg-[#5a1d1d] px-2 py-1 text-xs text-red-200"
            :style="{ marginLeft: paddingLeft }"
        >
            <TriangleAlert class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
            <span
                >A file or folder <strong>{{ renameValue.trim() }}</strong> already exists. Please
                choose a different name.</span
            >
        </div>

        <!-- Children (only rendered for expanded folders) -->
        <template v-if="node.type === 'folder' && node.isExpanded">
            <!-- Inline creation input (first child position) -->
            <div v-if="isCreating" class="mt-0.5">
                <div
                    class="flex items-center gap-1 px-1 py-1"
                    :style="{ paddingLeft: childPaddingLeft }"
                >
                    <span class="w-4 flex-shrink-0" />
                    <File
                        v-if="creatingType === 'file'"
                        class="text-sidebar-foreground h-4 w-4 flex-shrink-0"
                    />
                    <Folder v-else class="text-sidebar-foreground h-4 w-4 flex-shrink-0" />
                    <input
                        ref="inputRef"
                        v-model="newItemName"
                        @keydown="handleCreateKeydown"
                        @blur="handleCreateBlur"
                        type="text"
                        :placeholder="creatingType === 'file' ? 'filename.ext' : 'foldername'"
                        :class="
                            cn(
                                'bg-sidebar-accent text-sidebar-accent-foreground flex-1 rounded px-2 py-0.5 text-sm outline-none focus:ring-1',
                                isCreateDuplicate
                                    ? 'ring-1 ring-red-500 focus:ring-red-500'
                                    : 'focus:ring-primary',
                            )
                        "
                    />
                </div>
                <!-- Duplicate error -->
                <div
                    v-if="isCreateDuplicate"
                    class="mx-3 mt-0.5 flex items-start gap-1.5 rounded border border-red-500 bg-[#5a1d1d] px-2 py-1 text-xs text-red-200"
                    :style="{ marginLeft: childPaddingLeft }"
                >
                    <TriangleAlert class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                    <span
                        >A file or folder <strong>{{ newItemName.trim() }}</strong> already exists.
                        Please choose a different name.</span
                    >
                </div>
            </div>

            <!-- Recursive children -->
            <FileTreeItem
                v-for="child in node.children"
                :key="child.path"
                :node="child"
                :depth="depth + 1"
                :current-file="currentFile"
                :sibling-names="(node.children || []).map((c) => c.name)"
                :creating-in="creatingIn"
                :renaming-path="renamingPath"
                :selected-paths="selectedPaths"
                :clipboard-paths="clipboardPaths"
                :clipboard-mode="clipboardMode"
                @item-click="(e, n) => emit('item-click', e, n)"
                @item-dblclick="(e, n) => emit('item-dblclick', e, n)"
                @toggle-folder="emit('toggle-folder', $event)"
                @context-menu="(e, n) => emit('context-menu', e, n)"
                @move-item="(src, dir) => emit('move-item', src, dir)"
                @confirm-create="(fp, name, type) => emit('confirm-create', fp, name, type)"
                @cancel-create="emit('cancel-create')"
                @confirm-rename="(op, nn) => emit('confirm-rename', op, nn)"
                @cancel-rename="emit('cancel-rename')"
                @delete-item="emit('delete-item', $event)"
            />
        </template>
    </div>
</template>
