/**
 * Platform detection helper for keyboard shortcut display.
 * Uses Mac symbols (⌘, ⌥, ⇧) on macOS, text labels (Ctrl, Alt, Shift) elsewhere.
 */

export const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export interface ShortcutKeys {
  meta?: boolean;   // ⌘ / Ctrl
  alt?: boolean;    // ⌥ / Alt
  shift?: boolean;  // ⇧ / Shift
  key: string;      // The actual key (e.g. 'X', 'C', 'V')
}

/**
 * Format a keyboard shortcut for display.
 * On Mac: ⌥⇧⌘C  |  On Windows/Linux: Ctrl+Shift+Alt+C
 */
export function formatShortcut(keys: ShortcutKeys): string {
  if (isMac) {
    let result = '';
    if (keys.alt) result += '⌥';
    if (keys.shift) result += '⇧';
    if (keys.meta) result += '⌘';
    result += keys.key;
    return result;
  }

  const parts: string[] = [];
  if (keys.meta) parts.push('Ctrl');
  if (keys.shift) parts.push('Shift');
  if (keys.alt) parts.push('Alt');
  parts.push(keys.key);
  return parts.join('+');
}

/** Pre-formatted shortcuts for common actions */
export const shortcuts = {
  cut:              formatShortcut({ meta: true, key: 'X' }),
  copy:             formatShortcut({ meta: true, key: 'C' }),
  paste:            formatShortcut({ meta: true, key: 'V' }),
  copyPath:         formatShortcut({ meta: true, alt: true, key: 'C' }),
  copyRelativePath: formatShortcut({ meta: true, alt: true, shift: true, key: 'C' }),
} as const;
