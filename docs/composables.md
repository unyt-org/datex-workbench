# Composables Guide

Composables are reusable stateful logic functions in Vue 3. They encapsulate reactive state and related functionality.

## Overview

All composables are located in `src/composable/` and follow the naming convention `use*.ts`.

## Available Composables

### useBlockSimulator

**Purpose:** Fetch and simulate DATEX blocks for testing.

**Location:** `src/composable/useBlockSimulator.ts`

```typescript
import { useBlockSimulator } from '@/composable/useBlockSimulator';

// Types
interface BlockType {
    id: string;
    label: string;
    description: string;
    url: string;
}

// API
const { BLOCK_TYPES, sendBlock, sendBlockById, preloadBlocks } = useBlockSimulator();

// Send a specific block type
await sendBlock(blockType, baseInterface, socketUUID);

// Send a block by its ID
await sendBlockById('receivers', baseInterface, socketUUID);

// Preload all blocks into cache
await preloadBlocks();
```

### useLayoutTree

**Purpose:** Manage the reactive layout tree structure.

**Location:** `src/composable/useLayoutTree.ts`

```typescript
import {
    useLayoutTree,
    cloneNodeWithNewId,
    collapseSplit,
    replacePanel,
    removeSourceFromParent,
    findNodeById,
    findParentById,
} from '@/composable/useLayoutTree';

// Get the reactive layout tree
const { layoutTree } = useLayoutTree();

// Clone a node with new IDs
const cloned = cloneNodeWithNewId(node);

// Collapse a split, keeping one child
collapseSplit(nodeToKeep);

// Replace panel content
replacePanel(targetPanel, sourcePanel);

// Remove a node from parent split
removeSourceFromParent(nodeId);

// Find nodes in the tree
const node = findNodeById(layoutTree, 'node-id');
const parent = findParentById('node-id');
```

### useNetworkInspector

**Purpose:** Capture, store, and display network blocks.

**Location:** `src/composable/useNetworkInspector.ts`

```typescript
import { useNetworkInspector } from '@/composable/useNetworkInspector';

const {
    blocks, // All captured blocks
    displayedBlocks, // Paginated blocks (lazy loading)
    hasMoreBlocks, // Whether more blocks exist
    loadMoreBlocks, // Load more blocks
    sendTestBlock, // Send a test block
    resetLoadedCount, // Reset pagination
    saveBlocksToStorage,
} = useNetworkInspector();

// Load more blocks on scroll
function onScroll() {
    if (hasMoreBlocks.value) {
        loadMoreBlocks();
    }
}
```

### useEditorTabs

**Purpose:** Manage editor tabs and file editing state.

**Location:** `src/composable/useEditorTabs.ts`

```typescript
import { useEditorTabs } from '@/composable/useEditorTabs';

const { tabs, activeTab, addTab, closeTab, setActiveTab } = useEditorTabs();

// Add a new tab
addTab({ id: 'file1', name: 'example.txt', content: '' });

// Close a tab
closeTab('file1');

// Set active tab
setActiveTab('file1');
```

### useDragDrop

**Purpose:** Generic drag and drop functionality.

**Location:** `src/composable/useDragDrop.ts`

```typescript
import { useDragDrop } from '@/composable/useDragDrop';

const { isDragging, dragData, startDrag, endDrag } = useDragDrop();
```

### useFileDragDrop

**Purpose:** File drag and drop with validation.

**Location:** `src/composable/useFileDragDrop.ts`

```typescript
import { useFileDragDrop } from '@/composable/useFileDragDrop';

const { isDragging, droppedFiles, handleDragOver, handleDrop } = useFileDragDrop({
    accept: ['.txt', '.md'],
    multiple: true,
});
```

### useFileSelection

**Purpose:** Track selected files in the file tree.

**Location:** `src/composable/useFileSelection.ts`

```typescript
import { useFileSelection } from '@/composable/useFileSelection';

const { selectedFiles, selectFile, clearSelection } = useFileSelection();

selectFile('path/to/file');
```

### useFileClipboard

**Purpose:** Clipboard operations for files (cut, copy, paste).

**Location:** `src/composable/useFileClipboard.ts`

```typescript
import { useFileClipboard } from '@/composable/useFileClipboard';

const { clipboardAction, clipboardFiles, performAction, paste } = useFileClipboard();

// Cut files
performAction('cut', ['file1.txt', 'file2.txt']);

// Paste files
paste();
```

### usePointerPreferences

**Purpose:** Persist pointer display preferences to localStorage.

**Location:** `src/composable/usePointerPreferences.ts`

```typescript
import { usePointerPreferences } from '@/composable/usePointerPreferences';

const { preferences, updatePreference, resetPreferences } = usePointerPreferences();

updatePreference('showRawPointers', true);
```

### usePlatform

**Purpose:** Detect the current platform (browser, desktop, etc.).

**Location:** `src/composable/usePlatform.ts`

```typescript
import { usePlatform } from '@/composable/usePlatform';

const { isDesktop, isMobile, platform } = usePlatform();
```

### useDatexRepl

**Purpose:** DATEX REPL integration for interactive evaluation.

**Location:** `src/components/useDatexRepl.ts`

```typescript
import { useDatexRepl } from '@/components/useDatexRepl';

const { execute, history, clearHistory } = useDatexRepl();

// Execute DATEX code
const result = await execute('1 + 1');
```

## Creating a New Composable

### Template

```typescript
// src/composable/useMyFeature.ts
import { ref, computed } from 'vue';

interface MyOptions {
    initialValue?: string;
    maxItems?: number;
}

export function useMyFeature(options: MyOptions = {}) {
    const { initialValue = '', maxItems = 10 } = options;

    // Reactive state
    const items = ref<string[]>([]);
    const isLoading = ref(false);

    // Computed
    const itemCount = computed(() => items.value.length);
    const hasItems = computed(() => items.value.length > 0);

    // Methods
    function addItem(item: string) {
        if (items.value.length >= maxItems) {
            throw new Error(`Maximum items (${maxItems}) reached`);
        }
        items.value.push(item);
    }

    function removeItem(item: string) {
        const index = items.value.indexOf(item);
        if (index !== -1) {
            items.value.splice(index, 1);
        }
    }

    function clearItems() {
        items.value = [];
    }

    return {
        items,
        isLoading,
        itemCount,
        hasItems,
        addItem,
        removeItem,
        clearItems,
    };
}
```

### Usage

```vue
<script setup lang="ts">
import { useMyFeature } from '@/composable/useMyFeature';

const { items, itemCount, hasItems, addItem, removeItem, clearItems } = useMyFeature({
    initialValue: 'default',
    maxItems: 5,
});
</script>
```

## Best Practices

1. **Naming**: Prefix composable names with `use`
2. **Single Responsibility**: Each composable should handle one concern
3. **Type Safety**: Use TypeScript interfaces for options and return types
4. **Documentation**: Document parameters and return values
5. **Error Handling**: Throw descriptive errors with context
6. **Reactivity**: Use `ref` and `reactive` for state, `computed` for derived values
