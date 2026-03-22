import { ref, computed } from 'vue';
import type { FileTreeNode } from '@/types/FileTree';
import { isMac } from './usePlatform';

/**
 * Composable for VS Code-style multi-file selection.
 *
 * Supports:
 * - Single click → select one item (clears previous)
 * - Cmd/Ctrl+Click → toggle individual item (additive)
 * - Shift+Click → select contiguous range from anchor
 */
export function useFileSelection() {
    const selectedPaths = ref<Set<string>>(new Set());
    const lastClickedPath = ref<string | null>(null);

    // ── Helpers ────────────────────────────────────────────────────────

    /**
     * Flatten the visible tree into an ordered path list.
     * Only children of expanded folders are included.
     */
    function getVisiblePaths(tree: FileTreeNode[]): string[] {
        const paths: string[] = [];
        function walk(nodes: FileTreeNode[]) {
            for (const node of nodes) {
                paths.push(node.path);
                if (node.type === 'folder' && node.isExpanded && node.children) {
                    walk(node.children);
                }
            }
        }
        walk(tree);
        return paths;
    }

    // ── Selection API ──────────────────────────────────────────────────

    function isSelected(path: string): boolean {
        return selectedPaths.value.has(path);
    }

    function clearSelection() {
        selectedPaths.value = new Set();
        lastClickedPath.value = null;
    }

    function selectSingle(path: string) {
        selectedPaths.value = new Set([path]);
        lastClickedPath.value = path;
    }

    function selectAll(tree: FileTreeNode[]) {
        const all = getVisiblePaths(tree);
        selectedPaths.value = new Set(all);
    }

    /**
     * Core click handler — call this from the item click event.
     * Returns `true` if this was a plain single-click (caller may open file).
     */
    function handleItemClick(path: string, event: MouseEvent, tree: FileTreeNode[]): boolean {
        const isMetaKey = isMac ? event.metaKey : event.ctrlKey;

        // ── Cmd/Ctrl+Click: toggle individual ────────────────────────
        if (isMetaKey && !event.shiftKey) {
            const next = new Set(selectedPaths.value);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            selectedPaths.value = next;
            lastClickedPath.value = path;
            return false; // multi-select — don't open file
        }

        // ── Shift+Click: range selection ─────────────────────────────
        if (event.shiftKey && !isMetaKey) {
            const anchor = lastClickedPath.value;
            if (!anchor) {
                selectSingle(path);
                return false;
            }

            const visible = getVisiblePaths(tree);
            const anchorIdx = visible.indexOf(anchor);
            const targetIdx = visible.indexOf(path);

            if (anchorIdx === -1 || targetIdx === -1) {
                selectSingle(path);
                return false;
            }

            const start = Math.min(anchorIdx, targetIdx);
            const end = Math.max(anchorIdx, targetIdx);
            const range = visible.slice(start, end + 1);

            selectedPaths.value = new Set(range);
            // Keep the original anchor (don't update lastClickedPath)
            return false;
        }

        // ── Plain click: single select ───────────────────────────────
        selectSingle(path);
        return true; // single click — caller may open file
    }

    /**
     * Call when the context menu opens on a specific node.
     * If the node isn't already selected, select only that node.
     */
    function ensureSelected(path: string) {
        if (!selectedPaths.value.has(path)) {
            selectSingle(path);
        }
    }

    const selectedCount = computed(() => selectedPaths.value.size);

    return {
        selectedPaths,
        lastClickedPath,
        selectedCount,
        isSelected,
        clearSelection,
        selectSingle,
        selectAll,
        handleItemClick,
        ensureSelected,
        getVisiblePaths,
    };
}
