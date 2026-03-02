<script setup lang="ts">
import { FilePlus, FolderPlus, Pencil, Trash2 } from 'lucide-vue-next';

interface Props {
  x: number;
  y: number;
  nodeType: 'file' | 'folder';
}

defineProps<Props>();

const emit = defineEmits<{
  'new-file': [];
  'new-folder': [];
  'rename': [];
  'delete': [];
  'close': [];
}>();

function handleAction(action: 'new-file' | 'new-folder' | 'rename' | 'delete') {
  emit(action as 'new-file');
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
        class="context-menu"
        :style="{ left: x + 'px', top: y + 'px' }"
        @keydown.escape="emit('close')"
      >
        <!-- Folder-only actions -->
        <template v-if="nodeType === 'folder'">
          <button class="context-menu-item" @click="handleAction('new-file')">
            <FilePlus class="w-4 h-4" />
            <span>New File</span>
          </button>
          <button class="context-menu-item" @click="handleAction('new-folder')">
            <FolderPlus class="w-4 h-4" />
            <span>New Folder</span>
          </button>
          <div class="context-menu-separator" />
        </template>

        <!-- Common actions (files + folders) -->
        <button class="context-menu-item" @click="handleAction('rename')">
          <Pencil class="w-4 h-4" />
          <span>Rename</span>
        </button>
        <button class="context-menu-item context-menu-item--danger" @click="handleAction('delete')">
          <Trash2 class="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.context-menu {
  position: fixed;
  min-width: 180px;
  background: var(--color-sidebar);
  border: 1px solid var(--color-sidebar-border);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1001;
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

.context-menu-separator {
  height: 1px;
  background: var(--color-sidebar-border);
  margin: 4px 0;
}
</style>
