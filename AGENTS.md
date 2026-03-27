# AGENTS.md - DATEX Workbench Development Guide

This file provides guidance for agents working with the DATEX Workbench codebase.

## Project Overview

DATEX Workbench is a Vue 3 + TypeScript developer tooling UI for the DATEX runtime.
It uses Vite for build tooling, Vitest for unit tests, and Tailwind CSS for styling.

## Build/Lint/Test Commands

```bash
# Development server with hot reload
npm run dev

# Type-check, compile and minify for production
npm run build

# Preview production build
npm run preview

# Run unit tests (Vitest with jsdom environment)
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests for a specific file
npm run test:unit -- src/utils/some.test.ts

# Run tests matching a pattern
npm run test:unit -- --grep "search term"

# Type-check with vue-tsc
npm run type-check

# Lint all files
npm run lint

# Auto-fix linting issues
npm run lint-fix

# Format code with Prettier
npm run format
```

### Node.js Version Requirement

- Minimum: Node.js 20.19.0
- Or: Node.js >= 22.12.0

## Code Style Guidelines

### TypeScript

- **Strict typing**: Use explicit types for function parameters and return values
- **Interfaces over type aliases** for object shapes (except unions/intersections)
- **Use `type` keyword** for unions, intersections, and mapped types
- **Avoid `any`**: Use `unknown` when type is truly unknown
- **Template literals** for string concatenation
- **Optional chaining** (`?.`) and nullish coalescing (`??`) for null/undefined handling

### Vue Components

- **Script Setup syntax** (`<script setup lang="ts">`)
- **PascalCase for component names** in template
- **kebab-case for component filenames** (e.g., `my-component.vue`)
- **Props validation** using `defineProps` with runtime or type-based declarations
- **Composables**: Prefix with `use` and use camelCase (e.g., `useBlockSimulator.ts`)
- **Events**: Use `defineEmits` with typed payloads
- **Lifecycle hooks**: Follow Vue 3 composition API patterns

### Naming Conventions

| Type          | Convention                             | Example                               |
| ------------- | -------------------------------------- | ------------------------------------- |
| Files (Vue)   | kebab-case                             | `my-component.vue`                    |
| Files (TS)    | kebab-case or PascalCase               | `useBlockSimulator.ts`, `Layout.ts`   |
| Interfaces    | PascalCase                             | `PanelNode`, `BlockType`              |
| Enums         | PascalCase                             | `NodeType`, `SplitDirection`          |
| Enum values   | PascalCase                             | `NodeType.Panel`                      |
| Functions     | camelCase                              | `fetchBlock()`, `sendBlockById()`     |
| Variables     | camelCase                              | `blockData`, `socketUUID`             |
| Constants     | PascalCase with UPPER for module-level | `BLOCK_TYPES`, `DEFAULT_RATIO`        |
| Types         | PascalCase                             | `ClassValue`, `Updater`               |
| Generic types | T, K, V, or descriptive                | `<T extends Record<string, unknown>>` |

### Import Organization

Organize imports in this order (separate with blank lines):

1. Vue core imports (`ref`, `computed`, etc.)
2. External library imports (vue-router, vueuse, etc.)
3. Internal aliases (`@/...`)
4. Relative imports (`./`, `../`)
5. Type imports (`import type { ... }`)

Example:

```typescript
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import type { Ref } from 'vue';
import { useEditorTabs } from '@/composable/useEditorTabs';
import { cn } from '@/lib/utils';
import type { PanelNode } from '@/types/layout';
```

### Formatting

- **Prettier** handles formatting automatically
- **Tab width**: 4 spaces (in Prettier config)
- **Semicolons**: Required
- **Single quotes**: For strings
- **Print width**: 100 characters
- **Trailing commas**: ESLint handles this
- **Run `npm run format`** before committing

### Tailwind CSS

- **Use `cn()` utility** from `@/lib/utils` for conditional classes
- **Do NOT use arbitrary values** unless absolutely necessary
- **Component classes**: Keep in component `<style>` or use shadcn patterns
- **Use shadcn/ui components** from `@/components/ui/`

```typescript
// Correct
<div :class="cn('flex items-center', isActive && 'bg-primary')">

// Avoid
<div :class="isActive ? 'bg-blue-500' : 'bg-gray-500'">
```

### Error Handling

- **Use try/catch** for async operations
- **Throw descriptive errors** with context
- **Log errors appropriately**: `console.error` for caught errors, `console.warn` for warnings
- **Never swallow errors silently** without logging

```typescript
// Correct pattern
try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
} catch (error) {
    console.error('Error fetching block:', error);
    throw error; // Re-throw with context
}
```

### Testing

- **Test files**: Place in `src/**/__tests__/*` directory
- **Naming**: `{module}.test.ts` pattern
- **Use `@vue/test-utils`** for Vue component testing
- **Mock external dependencies** appropriately

## Project Structure

```
src/
├── App.vue              # Root component
├── main.ts              # Application entry
├── assets/              # Static assets
├── components/
│   ├── ui/              # shadcn/ui components
│   └── *.vue            # Feature components
├── composable/          # Vue composables (useXxx.ts)
├── lib/                 # Utilities and runtime integration
├── router/              # Vue Router configuration
├── types/               # TypeScript type definitions
│   └── [Feature]/       # Feature-specific types
└── utils/               # Pure utility functions
    └── *.ts
```

## Aliases

| Alias | Resolution |
| ----- | ---------- |
| `@`   | `./src/`   |

## Key Dependencies

- **Vue 3.5** - UI framework
- **Vue Router** - Client-side routing
- **VueUse** - Vue composition utilities
- **Tailwind CSS 4** - Styling
- **Vitest** - Unit testing
- **vue-tsc** - Type checking

## Common Issues

1. **Type checking fails**: Run `npm run type-check` before committing
2. **Formatting issues**: Run `npm run format` and `npm run lint-fix`
3. **Test failures**: Check jsdom environment compatibility
4. **Import errors**: Ensure `@/` alias is configured in IDE
