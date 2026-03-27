# Components Guide

## UI Components (`components/ui/`)

The application uses shadcn/ui components built on Reka UI.

### Available Components

| Component     | Path             | Description                  |
| ------------- | ---------------- | ---------------------------- |
| Accordion     | `accordion/`     | Collapsible content panels   |
| Alert Dialog  | `alert-dialog/`  | Modal dialogs with alerts    |
| Button        | `button/`        | Interactive buttons          |
| Checkbox      | `checkbox/`      | Boolean selection            |
| Dropdown Menu | `dropdown-menu/` | Context menus                |
| Input         | `input/`         | Text input fields            |
| Label         | `label/`         | Form labels                  |
| Menubar       | `menubar/`       | Menu bar navigation          |
| Popover       | `popover/`       | Floating content panels      |
| Resizable     | `resizable/`     | Resizable panels             |
| Scroll Area   | `scroll-area/`   | Custom scrollbar styling     |
| Separator     | `separator/`     | Horizontal/vertical dividers |
| Sheet         | `sheet/`         | Slide-out panels             |
| Sidebar       | `sidebar/`       | Side navigation              |
| Skeleton      | `skeleton/`      | Loading placeholders         |
| Switch        | `switch/`        | Toggle switches              |
| Table         | `table/`         | Data tables                  |
| Tooltip       | `tooltip/`       | Hover tooltips               |

## Feature Components

### Header Components

**HeaderProvider.vue**

- Top navigation bar
- Theme switching
- Navigation links

**ThemeSwitch.vue**

- Light/dark mode toggle

### Block Viewer Components

Located in `components/BlockViewer/`:

- Block visualization components
- Block type definitions in `useBlockSimulator.ts`

### Editor Components

Located in `components/Editor/`:

- Monaco editor integration
- Tab management
- File operations

### Network Inspector Components

Located in `components/NetworkInspector/`:

| Component             | Purpose                       |
| --------------------- | ----------------------------- |
| `DataTable.vue`       | AG Grid table wrapper         |
| `NetworkFilter.vue`   | Block filtering UI            |
| `SortableHeader.vue`  | Sortable column headers       |
| `HighlightedText.vue` | Syntax highlighting           |
| `TooltipWrapper.vue`  | Tooltip integration           |
| `cellRenderers/`      | Custom AG Grid cell renderers |
| `columns.ts`          | Column definitions            |

### Endpoint Components

Located in `components/endpoint/`:

- `EndpointView.vue` - Endpoint detail view

### Pointer Components

| Component                | Purpose                     |
| ------------------------ | --------------------------- |
| `PointerView.vue`        | Pointer explorer main view  |
| `PointerTreeItem.vue`    | Tree node for pointers      |
| `PointerRefInline.vue`   | Inline pointer reference    |
| `PointerPreferences.vue` | Pointer display preferences |

### ComHub Components

| Component                   | Purpose                 |
| --------------------------- | ----------------------- |
| `ComHubOverviewWrapper.vue` | ComHub overview wrapper |
| `ComHubEndpointList.vue`    | Endpoint list display   |
| `ComHubInterfaceList.vue`   | Interface list display  |

### Shared Components

- `Window.vue` - Window container component

## Using UI Components

### Button Example

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>

<template>
    <Button variant="default" size="default"> Click Me </Button>
</template>
```

### Dialog Example

```vue
<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
</script>

<template>
    <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription> This action cannot be undone. </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
```

### Using the `cn()` Utility

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const isActive = ref(true);
</script>

<template>
    <Button :class="cn('px-4', isActive && 'bg-primary')"> Dynamic Button </Button>
</template>
```

## Creating New Components

### File Naming

- Use **kebab-case** for filenames: `my-component.vue`
- Use **PascalCase** for component names in templates

### Component Template

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
    title: string;
    variant?: 'default' | 'outline';
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
});

const emit = defineEmits<{
    click: [event: MouseEvent];
}>();

function handleClick(event: MouseEvent) {
    emit('click', event);
}
</script>

<template>
    <div :class="cn('flex items-center', $attrs.class)">
        <h2>{{ props.title }}</h2>
        <Button :variant="props.variant" @click="handleClick">
            <slot />
        </Button>
    </div>
</template>
```

### Style Guidelines

1. Use Tailwind CSS classes in templates
2. Use `cn()` utility for conditional classes
3. Keep styles scoped to the component
4. Avoid inline styles unless necessary
