# Architecture Overview

## Application Architecture

DATEX Workbench follows a component-based architecture with Vue 3's Composition API.

## Core Layers

### 1. Entry Point (`main.ts`)

```typescript
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

The application is initialized with:

- Vue app instance
- Vue Router plugin

### 2. Root Component (`App.vue`)

The root component provides:

- **SideBar** - Side bar with navigation and theme switch
- **RouterView** - Main content area with `<Suspense>` wrapper

```vue
<template>
    <div class="flex h-screen flex-col">
        <div class="flex grow overflow-hidden">
            <!-- SideBar -->
            <SideBar class="z-53 flex-none" />

            <main class="main relative flex-1 overflow-hidden">

                <!-- Main content area -->
                <Suspense>
                    <RouterView />
                </Suspense>
            </main>
        </div>
    </div>
</template>
```

### 3. Router Layer (`router/index.ts`)

Lazy-loaded route components for code splitting:

| Route             | Component                     | Purpose                   |
| ----------------- | ----------------------------- | ------------------------- |
| `/`               | WelcomeView                   | Landing page              |
| `/blocks`         | DatexBlockProtocolViewWrapper | Block protocol viewer     |
| `/network`        | NetworkInspectorView          | Network traffic inspector |
| `/editor`         | EditorViewWrapper             | Code editor               |
| `/windows`        | WindowGeneralView             | Window management         |
| `/comhub`         | ComHubOverviewWrapper         | ComHub overview           |
| `/u/:endpoint_id` | EndpointView                  | Endpoint details          |
| `/pointers`       | PointerView                   | Pointer explorer          |
| `/repl`           | DatexRepl                     | Interactive REPL          |

### 4. Views Layer

Route-level components located in `src/views/`:

- Handle page-level layout
- Coordinate between composables and child components
- Manage route-specific state

### 5. Components Layer

Located in `src/components/`:

**UI Components** (`components/ui/`)

- shadcn/ui components via Reka UI
- Tailwind CSS styling
- Located in subdirectories (button/, input/, table/, etc.)

**Feature Components**

- `BlockViewer/` - Block visualization components
- `Editor/` - Code editor integration
- `NetworkInspector/` - Network monitoring UI
- `endpoint/` - Endpoint management

### 6. Composables Layer (`src/composable/`)

Stateful logic extracted into reusable composables:

| Composable              | Purpose                           |
| ----------------------- | --------------------------------- |
| `useBlockSimulator`     | Block fetching and simulation     |
| `useLayoutTree`         | Layout tree state management      |
| `useNetworkInspector`   | Network block capture and storage |
| `useEditorTabs`         | Editor tab management             |
| `useDragDrop`           | Generic drag and drop             |
| `useFileDragDrop`       | File drag and drop                |
| `useFileSelection`      | File selection state              |
| `useFileClipboard`      | Clipboard operations              |
| `usePointerPreferences` | Pointer preference storage        |
| `usePlatform`           | Platform detection                |
| `useDatexRepl`          | REPL integration                  |

### 7. Library Layer (`src/lib/`)

- `runtime.ts` - DATEX runtime initialization and helpers
- `utils.ts` - Utility functions (`cn`, `valueUpdater`)
- `pointer-utils.ts` - Pointer manipulation utilities
- `pointer-types.ts` - Pointer type definitions

### 8. Types Layer (`src/types/`)

TypeScript type definitions:

- `layout.ts` - Layout tree types (NodeType, PanelNode, SplitNode)
- `FileTree.ts` - File tree structure types
- `NetworkInspector/` - Network inspector types

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     App.vue (Root)                          │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ SideBar         │    │        RouterView               │ │
│  └─────────────────┘    │  ┌────────────────────────────┐ │ │
│                         │  │     View Components        │ │ │
│                         │  │  ┌─────────────────────┐   │ │ │
│                         │  │  │  Composables        │   │ │ │
│                         │  │  │  ┌───────────────┐  │   │ │ │
│                         │  │  │  │   Library     │  │   │ │ │
│                         │  │  │  │  ┌─────────┐  │  │   │ │ │
│                         │  │  │  │  │ Runtime │  │  │   │ │ │
│                         │  │  │  │  └─────────┘  │  │   │ │ │
│                         │  │  │  └───────────────┘  │   │ │ │
│                         │  │  └─────────────────────┘   │ │ │
│                         │  └────────────────────────────┘ │ │
│                         └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## State Management

The application uses **Vue's reactivity system** for state management:

1. **Reactive composables** - Module-level reactive state shared across components
2. **Component-local state** - `ref()` and `reactive()` for component-specific state
3. **Props and emits** - Parent-child communication

### Example: Layout Tree State

```typescript
// src/composable/useLayoutTree.ts
const layoutTree = reactive<LayoutNode<DefaultData>>({
    type: NodeType.Panel,
    id: getNewPanelId(),
    label: 'Root',
    data: {},
});

export function useLayoutTree<T extends Record<string, unknown> = DefaultData>() {
    return { layoutTree: layoutTree as LayoutNode<T> };
}
```

## External Integrations

### DATEX Runtime

The `lib/runtime.ts` module provides:

- Runtime initialization with default WebSocket configuration
- Pointer retrieval
- ComHub metadata access
- Interface/socket management

### Monaco Editor

Integrated via `modern-monaco` for:

- Syntax highlighting
- Code completion
- Multiple file editing

### AG Grid

Used in Network Inspector for:

- Sortable tables
- Virtualized scrolling
- Custom cell renderers

## Build Configuration

- **Vite** - Development server and production builds
- **PWA** - Progressive Web App support
- **Tailwind CSS** - Via Vite plugin
- **TypeScript** - Via vue-tsc for type checking
