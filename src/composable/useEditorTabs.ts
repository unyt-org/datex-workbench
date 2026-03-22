import { ref, computed } from 'vue';

// ── State ──────────────────────────────────────────────────────────
const openFiles = ref<string[]>([]);
const _activeFile = ref<string>('');
const _previewFile = ref<string>(''); // The path of the currently active "preview" tab

// ── Derived ────────────────────────────────────────────────────────
export const activeFile = computed(() => _activeFile.value);
export const openFilesList = computed(() => openFiles.value);
export const previewFile = computed(() => _previewFile.value);

// ── Actions ────────────────────────────────────────────────────────

/**
 * Open a file in the tab bar.
 * @param path The file path to open
 * @param asPreview If true, it replaces the existing preview tab.
 *                  If false, it pins the tab.
 * @returns the path opened
 */
export function openFile(path: string, asPreview = true): string {
    const index = openFiles.value.indexOf(path);

    if (index !== -1) {
        // Already open. Just make it active.
        _activeFile.value = path;
        // If opened permanently (e.g. via drag), un-preview it if it was a preview.
        if (!asPreview && _previewFile.value === path) {
            _previewFile.value = '';
        }
        return path;
    }

    // File is not open yet.
    if (asPreview) {
        if (_previewFile.value) {
            // Replace existing preview tab
            const pIdx = openFiles.value.indexOf(_previewFile.value);
            if (pIdx !== -1) {
                openFiles.value.splice(pIdx, 1, path);
            } else {
                openFiles.value.push(path);
            }
        } else {
            openFiles.value.push(path);
        }
        _previewFile.value = path;
    } else {
        // Open as pinned
        openFiles.value.push(path);
    }

    _activeFile.value = path;
    return path;
}

/**
 * Pins the currently active preview tab, making it permanent.
 */
export function pinCurrentTab() {
    if (_activeFile.value && _previewFile.value === _activeFile.value) {
        _previewFile.value = '';
    }
}

/**
 * Close a tab. Switches focus to the nearest remaining tab.
 * Returns the new active file path (empty string if no tabs remain).
 */
export function closeFile(path: string): string {
    if (_previewFile.value === path) _previewFile.value = '';
    const idx = openFiles.value.indexOf(path);
    if (idx === -1) return _activeFile.value;

    openFiles.value.splice(idx, 1);

    if (openFiles.value.length === 0) {
        _activeFile.value = '';
    } else if (_activeFile.value === path) {
        // Prefer the tab to the right, fall back to the one to the left
        const nextIdx = Math.min(idx, openFiles.value.length - 1);
        _activeFile.value = openFiles.value[nextIdx]!;
    }

    return _activeFile.value;
}

/**
 * Switch which tab is visible without changing the open files list.
 */
export function setActiveFile(path: string) {
    if (openFiles.value.includes(path)) {
        _activeFile.value = path;
    }
}

/**
 * When a file is renamed/moved, update the open tab.
 */
export function renameOpenFile(oldPath: string, newPath: string) {
    const idx = openFiles.value.indexOf(oldPath);
    if (idx !== -1) {
        openFiles.value[idx] = newPath;
        if (_activeFile.value === oldPath) _activeFile.value = newPath;
    }
}

/**
 * When a file is deleted, close its tab if open.
 */
export function closeFileIfOpen(path: string): string {
    if (openFiles.value.includes(path)) return closeFile(path);
    return _activeFile.value;
}

/** Initialise from persisted state (called once on mount) */
export function initTabs(files: string[], active: string) {
    openFiles.value = files;
    _activeFile.value = active;
    // Assume saved tabs are pinned
    _previewFile.value = '';
}
