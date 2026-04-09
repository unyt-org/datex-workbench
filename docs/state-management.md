# State Management

## Overview

DATEX Workbench uses Vue's built-in reactivity system for state management, rather than external state libraries like Pinia or Vuex.

## State Management Patterns

### 1. Component-Local State

For component-specific state, use `ref` and `reactive`:

```typescript
import { ref, reactive } from 'vue';

// Primitive values
const count = ref(0);
const name = ref('DatEx');

// Objects
const state = reactive({
    user: null,
    loading: false,
    error: null,
});

// Modify refs
count.value++;
state.loading = true;

// Access refs (automatic unwrapping in templates)
console.log(count.value);
console.log(state.user);
```

### 2. Module-Level Shared State

For state shared across components, define reactive state at the module level:

```typescript
// src/composable/useLayoutTree.ts
import { reactive } from 'vue';

interface LayoutNode {
    type: 'panel' | 'split';
    id: string;
    label: string;
    children?: LayoutNode[];
}

// Module-level reactive state
const layoutTree = reactive<LayoutNode>({
    type: 'panel',
    id: 'root',
    label: 'Root',
});

export function useLayoutTree() {
    return { layoutTree };
}
```

**Usage in components:**

```vue
<script setup lang="ts">
import { useLayoutTree } from '@/composable/useLayoutTree';

const { layoutTree } = useLayoutTree();
</script>
```

### 3. Composable Pattern

Encapsulate state and related logic in composables:

```typescript
// src/composable/useNetworkInspector.ts
import { ref, computed } from 'vue';

const MAX_BLOCKS = 200;

const blocks = ref<Block[]>([]);
const loadedCount = ref(20);

const displayedBlocks = computed(() => blocks.value.slice(0, loadedCount.value));
const hasMore = computed(() => loadedCount.value < blocks.value.length);

function loadMore() {
    loadedCount.value = Math.min(loadedCount.value + 20, blocks.value.length);
}

export function useNetworkInspector() {
    return {
        blocks,
        displayedBlocks,
        hasMore,
        loadMore,
    };
}
```

## State Persistence

### LocalStorage

Use localStorage for persisting user preferences:

```typescript
// src/composable/usePointerPreferences.ts
const STORAGE_KEY = 'datex-workbench:pointer-preferences';

interface Preferences {
    showRawPointers: boolean;
    maxDisplayDepth: number;
}

const defaultPreferences: Preferences = {
    showRawPointers: false,
    maxDisplayDepth: 3,
};

export function usePointerPreferences() {
    const preferences = reactive<Preferences>(loadPreferences());

    function loadPreferences(): Preferences {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
        } catch {
            return defaultPreferences;
        }
    }

    function savePreferences() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }

    function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
        preferences[key] = value;
        savePreferences();
    }

    return { preferences, updatePreference, savePreferences };
}
```

### Serialization

Serialize complex data for storage:

```typescript
// ArrayBuffer to Base64
function arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
        binary += String.fromCharCode(buffer[i]!);
    }
    return btoa(binary);
}

// Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
```

## Computed Properties

Derive state from other state:

```typescript
import { computed } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');

const fullName = computed(() => `${firstName.value} ${lastName.value}`);

const isAdmin = ref(false);
const permissions = ref(['read', 'write']);

const userStatus = computed(() => {
    if (!isAdmin.value) return 'user';
    return permissions.value.includes('admin') ? 'superuser' : 'admin';
});
```

## Watchers

React to state changes:

```typescript
import { watch, watchEffect } from 'vue';

// Watch a single ref
watch(count, (newValue, oldValue) => {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
});

// Watch multiple sources
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
    console.log(`Changed: ${oldCount} -> ${newCount}, ${oldName} -> ${newName}`);
});

// Immediate watch
watch(
    blocks,
    (newBlocks) => {
        saveBlocksToStorage(newBlocks);
    },
    { immediate: true },
);

// watchEffect - automatic dependency tracking
watchEffect(() => {
    console.log(`Count is: ${count.value}`);
    console.log(`Name is: ${name.value}`);
});
```

## Provider Pattern

Share state across component trees:

```typescript
// src/lib/runtime.ts
import { Runtime } from '@unyt/datex';

export const Datex: Runtime = await Runtime.create({
    interfaces: [{ type: 'websocket-client', config: { url: 'wss://example.unyt.land' } }],
});

// src/components/HeaderProvider.vue
import { Datex } from '@/lib/runtime';

provide('datex', Datex);

// src/views/SomeView.vue
import { inject } from 'vue';

const datex = inject('datex');
```

## State Update Patterns

### Immutable Updates

```typescript
// Arrays
const items = ref([1, 2, 3]);

// Add item
items.value = [...items.value, 4];

// Remove item
items.value = items.value.filter((item) => item !== 2);

// Update item
items.value = items.value.map((item) => (item === 2 ? 20 : item));
```

### Batch Updates

```typescript
// Batch multiple state changes
await Promise.all([updateUserName('Alice'), updateUserEmail('alice@example.com'), fetchUserData()]);
```

## Best Practices

1. **Keep state minimal** - Derive values with `computed`
2. **Single source of truth** - Define shared state in one place
3. **Immutable patterns** - Prefer replacing over mutating
4. **Type safety** - Use TypeScript interfaces for state shapes
5. **Persistence** - Save important state to localStorage
6. **Documentation** - Document complex state structures
