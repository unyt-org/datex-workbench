<script setup lang="ts">
import {
    FilePlus,
    FolderPlus,
    Pencil,
    Trash2,
    Scissors,
    Copy,
    ClipboardPaste,
    Link,
} from 'lucide-vue-next';
import { shortcuts } from '@/composable/usePlatform';
import { ref, onMounted, nextTick } from 'vue';

// ── Props ──────────────────────────────────────────────────────────
interface Props {
    x: number;
    y: number;
    /** null when right-clicking on empty sidebar space (background context) */
    nodeType: 'file' | 'folder' | null;
    hasClipboard?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    hasClipboard: false,
});

const emit = defineEmits<{
    cut: [];
    copy: [];
    paste: [];
    'copy-path': [];
    'copy-relative-path': [];
    'new-file': [];
    'new-folder': [];
    rename: [];
    delete: [];
    close: [];
}>();

// ── Viewport-aware positioning ─────────────────────────────────────
const menuRef = ref<HTMLDivElement | null>(null);
const adjustedX = ref(props.x);
const adjustedY = ref(props.y);

onMounted(async () => {
    await nextTick();
    if (!menuRef.value) return;

    const rect = menuRef.value.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 8;

    // Flip left if menu overflows right edge
    if (props.x + rect.width + padding > vw) {
        adjustedX.value = Math.max(padding, props.x - rect.width);
    }

    // Flip up if menu overflows bottom edge
    if (props.y + rect.height + padding > vh) {
        adjustedY.value = Math.max(padding, props.y - rect.height);
    }
});

// ── Helpers ────────────────────────────────────────────────────────
/** Whether the menu was opened on a specific file/folder node */
const hasNode = props.nodeType !== null;

type Action =
    | 'cut'
    | 'copy'
    | 'paste'
    | 'copy-path'
    | 'copy-relative-path'
    | 'new-file'
    | 'new-folder'
    | 'rename'
    | 'delete';

function handleAction(action: Action) {
    emit(action as 'cut');
    emit('close');
}

function handleClickOutside(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('context-menu-backdrop')) {
        emit('close');
    }
}
</script>

<template>
    <Teleport to="body">
        <div
            class="context-menu-backdrop"
            @mousedown="handleClickOutside"
            @contextmenu.prevent="emit('close')"
        >
            <div
                ref="menuRef"
                class="context-menu"
                :style="{ left: adjustedX + 'px', top: adjustedY + 'px' }"
                @keydown.escape="emit('close')"
            >
                <!-- File/folder-specific items (hidden for background context menu) -->
                <template v-if="hasNode">
                    <!-- Cut / Copy -->
                    <button class="context-menu-item" @click="handleAction('cut')">
                        <Scissors class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Cut</span>
                        <span class="context-menu-shortcut">{{ shortcuts.cut }}</span>
                    </button>
                    <button class="context-menu-item" @click="handleAction('copy')">
                        <Copy class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Copy</span>
                        <span class="context-menu-shortcut">{{ shortcuts.copy }}</span>
                    </button>

                    <div class="context-menu-separator" />

                    <!-- Copy Path / Copy Relative Path -->
                    <button class="context-menu-item" @click="handleAction('copy-path')">
                        <Link class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Copy Path</span>
                        <span class="context-menu-shortcut">{{ shortcuts.copyPath }}</span>
                    </button>
                    <button class="context-menu-item" @click="handleAction('copy-relative-path')">
                        <Link class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Copy Relative Path</span>
                        <span class="context-menu-shortcut">{{ shortcuts.copyRelativePath }}</span>
                    </button>

                    <div class="context-menu-separator" />

                    <!-- Folder-only: New File / New Folder -->
                    <template v-if="nodeType === 'folder'">
                        <button class="context-menu-item" @click="handleAction('new-file')">
                            <FilePlus class="h-4 w-4 flex-shrink-0" />
                            <span class="context-menu-label">New File</span>
                        </button>
                        <button class="context-menu-item" @click="handleAction('new-folder')">
                            <FolderPlus class="h-4 w-4 flex-shrink-0" />
                            <span class="context-menu-label">New Folder</span>
                        </button>
                        <div class="context-menu-separator" />
                    </template>
                </template>

                <!-- New File / New Folder for background (root-level creation) -->
                <template v-if="!hasNode">
                    <button class="context-menu-item" @click="handleAction('new-file')">
                        <FilePlus class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">New File</span>
                    </button>
                    <button class="context-menu-item" @click="handleAction('new-folder')">
                        <FolderPlus class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">New Folder</span>
                    </button>
                    <div v-if="hasClipboard" class="context-menu-separator" />
                </template>

                <!-- Paste (always shown if clipboard has content) -->
                <template v-if="hasClipboard">
                    <button class="context-menu-item" @click="handleAction('paste')">
                        <ClipboardPaste class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Paste</span>
                        <span class="context-menu-shortcut">{{ shortcuts.paste }}</span>
                    </button>
                    <div v-if="hasNode" class="context-menu-separator" />
                </template>

                <!-- Rename / Delete (only for file/folder nodes) -->
                <template v-if="hasNode">
                    <button class="context-menu-item" @click="handleAction('rename')">
                        <Pencil class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Rename</span>
                    </button>
                    <button
                        class="context-menu-item context-menu-item--danger"
                        @click="handleAction('delete')"
                    >
                        <Trash2 class="h-4 w-4 flex-shrink-0" />
                        <span class="context-menu-label">Delete</span>
                    </button>
                </template>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.context-menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 51;
}

.context-menu {
    position: fixed;
    min-width: 220px;
    background: var(--color-sidebar);
    border: 1px solid var(--color-sidebar-border);
    border-radius: 6px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 52;
}

.context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--color-sidebar-foreground);
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
}

.context-menu-item:hover {
    background: var(--color-sidebar-accent);
    color: var(--color-sidebar-accent-foreground);
}

.context-menu-item--danger:hover {
    background: rgba(220, 38, 38, 0.2);
    color: #f87171;
}

.context-menu-label {
    flex: 1;
    text-align: left;
}

.context-menu-shortcut {
    font-size: 12px;
    color: var(--color-muted-foreground);
    opacity: 0.6;
    margin-left: auto;
    flex-shrink: 0;
    font-family:
        system-ui,
        -apple-system,
        sans-serif;
}

.context-menu-separator {
    height: 1px;
    background: var(--color-sidebar-border);
    margin: 4px 0;
}
</style>
