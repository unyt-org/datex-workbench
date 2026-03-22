<script setup lang="ts">
import { FilePlus, FolderPlus, TriangleAlert, File as FileIcon, Folder } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue';
import type { FileTreeNode } from '@/types/FileTree';
import type { CreatingState } from './FileTreeItem.vue';
import FileTreeItem from './FileTreeItem.vue';
import FolderContextMenu from './FolderContextMenu.vue';
import { useFileSelection } from '@/composable/useFileSelection';
import { useFileClipboard } from '@/composable/useFileClipboard';
import { isMac } from '@/composable/usePlatform';
import { getFileDragPath, isInvalidDrop, clearFileDragOver } from '@/composable/useFileDragDrop';

// ── Props ──────────────────────────────────────────────────────────
interface Props {
    tree: FileTreeNode[];
    currentFile?: string;
}

const props = defineProps<Props>();

// ── Emits ──────────────────────────────────────────────────────────
const emit = defineEmits<{
    'file-click': [path: string];
    'file-dblclick': [path: string];
    'toggle-folder': [path: string];
    'ensure-expand': [path: string];
    'create-file': [filename: string];
    'create-folder': [foldername: string];
    'create-file-in-folder': [folderPath: string, filename: string];
    'create-folder-in-folder': [folderPath: string, foldername: string];
    'rename-item': [oldPath: string, newName: string];
    'delete-item': [path: string];
    'paste-items': [targetPath: string, sourcePaths: string[], mode: 'cut' | 'copy'];
    'move-item': [srcPath: string, targetDir: string];
}>();

// ── Composables ────────────────────────────────────────────────────
const {
    selectedPaths,
    handleItemClick: handleSelectionClick,
    ensureSelected,
    clearSelection,
} = useFileSelection();

const {
    clipboardPaths,
    clipboardMode,
    hasClipboard,
    cut,
    copy,
    consumeForPaste,
    copyPathToClipboard,
    copyRelativePathToClipboard,
} = useFileClipboard();

// ── Centralized creation/rename state ──────────────────────────────
const creatingIn = ref<CreatingState | null>(null);
const renamingPath = ref<string | null>(null);

// ── Context menu state ─────────────────────────────────────────────
// node is null when right-clicking on empty sidebar space
const contextMenu = ref<{ x: number; y: number; node: FileTreeNode | null } | null>(null);

// ── Root-level creation state ──────────────────────────────────────
const isCreatingAtRoot = ref(false);
const rootCreationType = ref<'file' | 'folder'>('file');
const newItemName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// ── Sidebar container ref (for keyboard focus) ─────────────────────
const sidebarRef = ref<HTMLDivElement | null>(null);

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

// ── Item click handler (selection + file open) ─────────────────────
function handleItemClick(event: MouseEvent, node: FileTreeNode) {
    const isSingleClick = handleSelectionClick(node.path, event, props.tree);

    // Only open file on plain single-click (no modifiers)
    if (isSingleClick && node.type === 'file') {
        emit('file-click', node.path);
    }
}

function handleItemDblClick(event: MouseEvent, node: FileTreeNode) {
    if (node.type === 'file') {
        emit('file-dblclick', node.path);
    }
}

// ── Context menu handlers ──────────────────────────────────────────

/** Right-click on a file/folder node */
function handleNodeContextMenu(e: MouseEvent, node: FileTreeNode) {
    e.stopPropagation(); // prevent bubbling to the root @contextmenu handler
    ensureSelected(node.path);
    contextMenu.value = { x: e.clientX, y: e.clientY, node };
}

/** Right-click on empty sidebar space (background) */
function handleBackgroundContextMenu(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('[data-tree-item]')) return;
    e.preventDefault();
    clearSelection();
    contextMenu.value = { x: e.clientX, y: e.clientY, node: null };
}

/** Dragover on background: allow drop if a file is being dragged */
function handleBackgroundDragOver(e: DragEvent) {
    const src = getFileDragPath(e);
    if (src) e.preventDefault();
}

/** Drop on background: move dragged file/folder to root */
function handleBackgroundDrop(e: DragEvent) {
    e.preventDefault();
    clearFileDragOver();
    const src = getFileDragPath(e);
    if (!src || isInvalidDrop(src, '/')) return;
    emit('move-item', src, '/');
}

function closeContextMenu() {
    contextMenu.value = null;
}

function handleContextNewFile() {
    closeContextMenu();
    if (contextMenu.value?.node) {
        // Create inside a specific folder
        const folderPath = contextMenu.value.node.path;
        emit('ensure-expand', folderPath);
        nextTick(() => {
            creatingIn.value = { folderPath, type: 'file' };
        });
    } else {
        // Background right-click → create at root
        startCreateFileAtRoot();
    }
}

function handleContextNewFolder() {
    closeContextMenu();
    if (contextMenu.value?.node) {
        const folderPath = contextMenu.value.node.path;
        emit('ensure-expand', folderPath);
        nextTick(() => {
            creatingIn.value = { folderPath, type: 'folder' };
        });
    } else {
        startCreateFolderAtRoot();
    }
}

function handleContextRename() {
    if (!contextMenu.value?.node) return;
    const path = contextMenu.value.node.path;
    closeContextMenu();
    renamingPath.value = path;
}

function handleContextDelete() {
    if (!contextMenu.value?.node) return;
    const pathsToDelete =
        selectedPaths.value.size > 0 ? [...selectedPaths.value] : [contextMenu.value.node.path];

    closeContextMenu();
    for (const p of pathsToDelete) {
        emit('delete-item', p);
    }
    clearSelection();
}

// ── Context menu clipboard handlers ────────────────────────────────
function handleContextCut() {
    if (!contextMenu.value?.node) return;
    const paths =
        selectedPaths.value.size > 0 ? [...selectedPaths.value] : [contextMenu.value.node.path];
    cut(paths);
    closeContextMenu();
}

function handleContextCopy() {
    if (!contextMenu.value?.node) return;
    const paths =
        selectedPaths.value.size > 0 ? [...selectedPaths.value] : [contextMenu.value.node.path];
    copy(paths);
    closeContextMenu();
}

function handleContextPaste() {
    if (!contextMenu.value) return;
    const clip = consumeForPaste();
    if (!clip) return;

    // Determine target: folder node → paste inside, file node → parent dir, background → root
    const node = contextMenu.value.node;
    let targetPath = '/';
    if (node) {
        targetPath =
            node.type === 'folder'
                ? node.path
                : node.path.substring(0, node.path.lastIndexOf('/')) || '/';
    }

    closeContextMenu();
    emit('paste-items', targetPath, clip.paths, clip.mode);
}

function handleContextCopyPath() {
    if (!contextMenu.value?.node) return;
    copyPathToClipboard(contextMenu.value.node.path);
    closeContextMenu();
}

function handleContextCopyRelativePath() {
    if (!contextMenu.value?.node) return;
    copyRelativePathToClipboard(contextMenu.value.node.path);
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

// ── Toggle folder ──────────────────────────────────────────────────
function handleToggleFolder(folderPath: string) {
    emit('toggle-folder', folderPath);
}

// ── Keyboard shortcuts ─────────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
    const metaKey = isMac ? e.metaKey : e.ctrlKey;
    if (!metaKey) return;

    const key = e.key.toLowerCase();

    // ⌘X / Ctrl+X → Cut
    if (key === 'x' && !e.altKey && !e.shiftKey) {
        if (selectedPaths.value.size > 0) {
            e.preventDefault();
            cut([...selectedPaths.value]);
        }
        return;
    }

    // ⌘C / Ctrl+C → Copy (but not ⌥⌘C which is Copy Path)
    if (key === 'c' && !e.altKey && !e.shiftKey) {
        if (selectedPaths.value.size > 0) {
            e.preventDefault();
            copy([...selectedPaths.value]);
        }
        return;
    }

    // ⌘V / Ctrl+V → Paste
    if (key === 'v' && !e.altKey && !e.shiftKey) {
        const clip = consumeForPaste();
        if (clip) {
            e.preventDefault();
            const selected = [...selectedPaths.value];
            const targetPath = selected.length === 1 ? selected[0]! : '/';
            emit('paste-items', targetPath, clip.paths, clip.mode);
        }
        return;
    }

    // ⌥⌘C / Alt+Ctrl+C → Copy Path
    if (key === 'c' && e.altKey && !e.shiftKey) {
        if (selectedPaths.value.size > 0) {
            e.preventDefault();
            const firstPath = [...selectedPaths.value][0]!;
            copyPathToClipboard(firstPath);
        }
        return;
    }

    // ⇧⌥⌘C / Shift+Alt+Ctrl+C → Copy Relative Path
    if (key === 'c' && e.altKey && e.shiftKey) {
        if (selectedPaths.value.size > 0) {
            e.preventDefault();
            const firstPath = [...selectedPaths.value][0]!;
            copyRelativePathToClipboard(firstPath);
        }
        return;
    }
}

onMounted(() => {
    sidebarRef.value?.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    sidebarRef.value?.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div
        ref="sidebarRef"
        class="bg-sidebar border-sidebar-border flex h-full flex-col border-r focus:outline-none"
        tabindex="0"
        @contextmenu="handleBackgroundContextMenu"
    >
        <!-- Header with Actions -->
        <div class="border-sidebar-border flex items-center justify-between border-b px-4 py-3">
            <h2 class="text-sidebar-foreground text-sm font-semibold">Files</h2>
            <div class="flex items-center gap-1">
                <button
                    @click="startCreateFileAtRoot"
                    class="hover:bg-sidebar-accent rounded p-1.5 transition-colors"
                    title="New File"
                >
                    <FilePlus class="text-sidebar-foreground h-4 w-4" />
                </button>
                <button
                    @click="startCreateFolderAtRoot"
                    class="hover:bg-sidebar-accent rounded p-1.5 transition-colors"
                    title="New Folder"
                >
                    <FolderPlus class="text-sidebar-foreground h-4 w-4" />
                </button>
            </div>
        </div>

        <!-- File Tree: flex-1 min-h-0 constrains height; overflow-y auto scrolls cleanly -->
        <div
            class="min-h-0 flex-1 overflow-y-auto"
            @dragover="handleBackgroundDragOver"
            @drop="handleBackgroundDrop"
        >
            <div class="p-2 pb-20">
                <!-- Root-level New Item Input -->
                <div v-if="isCreatingAtRoot" class="mb-1">
                    <div class="flex items-center gap-1 px-2 py-1">
                        <span class="w-4 flex-shrink-0" />
                        <FileIcon
                            v-if="rootCreationType === 'file'"
                            class="text-sidebar-foreground h-4 w-4 flex-shrink-0"
                        />
                        <Folder v-else class="text-sidebar-foreground h-4 w-4 flex-shrink-0" />
                        <input
                            ref="inputRef"
                            v-model="newItemName"
                            @keydown="handleRootKeydown"
                            @blur="handleRootBlur"
                            type="text"
                            :placeholder="
                                rootCreationType === 'file' ? 'filename.ext' : 'foldername'
                            "
                            :class="
                                cn(
                                    'bg-sidebar-accent text-sidebar-accent-foreground flex-1 rounded px-2 py-0.5 text-sm outline-none focus:ring-1',
                                    isRootDuplicate
                                        ? 'ring-1 ring-red-500 focus:ring-red-500'
                                        : 'focus:ring-primary',
                                )
                            "
                        />
                    </div>
                    <div
                        v-if="isRootDuplicate"
                        class="mx-3 mt-0.5 flex items-start gap-1.5 rounded border border-red-500 bg-[#5a1d1d] px-2 py-1 text-xs text-red-200"
                    >
                        <TriangleAlert class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                        <span
                            >A file or folder <strong>{{ newItemName.trim() }}</strong> already
                            exists. Please choose a different name.</span
                        >
                    </div>
                </div>

                <!-- Tree Items -->
                <FileTreeItem
                    v-for="node in tree"
                    :key="node.path"
                    :node="node"
                    :depth="0"
                    :current-file="currentFile"
                    :sibling-names="tree.map((n) => n.name)"
                    :creating-in="creatingIn"
                    :renaming-path="renamingPath"
                    :selected-paths="selectedPaths"
                    :clipboard-paths="clipboardPaths"
                    :clipboard-mode="clipboardMode"
                    @item-click="handleItemClick"
                    @item-dblclick="handleItemDblClick"
                    @toggle-folder="handleToggleFolder"
                    @context-menu="handleNodeContextMenu"
                    @move-item="(src, dir) => emit('move-item', src, dir)"
                    @confirm-create="handleConfirmCreate"
                    @cancel-create="handleCancelCreate"
                    @confirm-rename="handleConfirmRename"
                    @cancel-rename="handleCancelRename"
                    @delete-item="emit('delete-item', $event)"
                />
            </div>
        </div>

        <!-- Context Menu -->
        <FolderContextMenu
            v-if="contextMenu"
            :x="contextMenu.x"
            :y="contextMenu.y"
            :node-type="contextMenu.node?.type ?? null"
            :has-clipboard="hasClipboard"
            @cut="handleContextCut"
            @copy="handleContextCopy"
            @paste="handleContextPaste"
            @copy-path="handleContextCopyPath"
            @copy-relative-path="handleContextCopyRelativePath"
            @new-file="handleContextNewFile"
            @new-folder="handleContextNewFolder"
            @rename="handleContextRename"
            @delete="handleContextDelete"
            @close="closeContextMenu"
        />
    </div>
</template>
