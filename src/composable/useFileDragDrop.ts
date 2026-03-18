import { ref } from 'vue';

const DRAG_DATA_KEY = 'text/x-file-path';

// ── Module-level singleton drag state ──────────────────────────────
// Shared across all FileTreeItem instances so any item can see who is
// being dragged and which folder is currently hovered as drop target.
export const draggedPath = ref<string | null>(null);
export const dragOverPath = ref<string | null>(null);

// ── Drop guard ─────────────────────────────────────────────────────

/**
 * Returns true when dropping srcPath onto targetDir would be a no-op or
 * illegal operation (dropping into the same parent dir, or a folder into
 * itself / one of its own descendants).
 */
export function isInvalidDrop(srcPath: string, targetDir: string): boolean {
  const srcDir = srcPath.substring(0, srcPath.lastIndexOf('/')) || '/';
  if (srcDir === targetDir) return true; // already there
  if (targetDir === srcPath) return true; // dropping onto itself
  if (targetDir.startsWith(srcPath + '/')) return true; // into a descendant
  return false;
}

// ── Drag lifecycle helpers ─────────────────────────────────────────

export function startFileDrag(path: string, event: DragEvent) {
  draggedPath.value = path;
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData(DRAG_DATA_KEY, path);
}

export function endFileDrag() {
  draggedPath.value = null;
  dragOverPath.value = null;
}

export function setFileDragOver(path: string, event: DragEvent) {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
  dragOverPath.value = path;
}

export function clearFileDragOver() {
  dragOverPath.value = null;
}

export function getFileDragPath(event: DragEvent): string | null {
  return event.dataTransfer?.getData(DRAG_DATA_KEY) ?? null;
}
