import { ref, computed } from 'vue';

/**
 * Composable for internal file clipboard operations (Cut / Copy / Paste)
 * and system clipboard path copying.
 */
export function useFileClipboard() {
    const clipboardPaths = ref<string[]>([]);
    const clipboardMode = ref<'cut' | 'copy' | null>(null);

    const hasClipboard = computed(
        () => clipboardPaths.value.length > 0 && clipboardMode.value !== null,
    );

    // ── Internal clipboard (Cut / Copy / Paste) ────────────────────

    function cut(paths: string[]) {
        clipboardPaths.value = [...paths];
        clipboardMode.value = 'cut';
    }

    function copy(paths: string[]) {
        clipboardPaths.value = [...paths];
        clipboardMode.value = 'copy';
    }

    function clearClipboard() {
        clipboardPaths.value = [];
        clipboardMode.value = null;
    }

    /**
     * Consume clipboard for a paste operation.
     * Returns the paths and mode, then clears clipboard if it was a cut.
     */
    function consumeForPaste(): { paths: string[]; mode: 'cut' | 'copy' } | null {
        if (!clipboardMode.value || clipboardPaths.value.length === 0) return null;

        const result = {
            paths: [...clipboardPaths.value],
            mode: clipboardMode.value,
        };

        // After pasting a cut, clear the clipboard (one-time move)
        if (clipboardMode.value === 'cut') {
            clearClipboard();
        }
        // After pasting a copy, keep clipboard (can paste again)

        return result;
    }

    // ── System clipboard (Copy Path) ───────────────────────────────

    async function copyPathToClipboard(path: string) {
        try {
            await navigator.clipboard.writeText(path);
        } catch (err) {
            console.error('Failed to copy path to clipboard:', err);
        }
    }

    async function copyRelativePathToClipboard(path: string) {
        // Remove leading "/" to make it relative
        const relative = path.startsWith('/') ? path.slice(1) : path;
        try {
            await navigator.clipboard.writeText(relative);
        } catch (err) {
            console.error('Failed to copy relative path to clipboard:', err);
        }
    }

    return {
        clipboardPaths,
        clipboardMode,
        hasClipboard,
        cut,
        copy,
        clearClipboard,
        consumeForPaste,
        copyPathToClipboard,
        copyRelativePathToClipboard,
    };
}
