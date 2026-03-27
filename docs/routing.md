# Routing Guide

## Overview

The application uses Vue Router for client-side routing with lazy-loaded route components.

## Route Configuration

**File:** `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // Routes defined here
    ],
});

export default router;
```

## Routes

| Path              | Name              | Component                           | Purpose                   |
| ----------------- | ----------------- | ----------------------------------- | ------------------------- |
| `/`               | `welcome`         | `WelcomeView.vue`                   | Landing page              |
| `/blocks`         | `blocks`          | `DatexBlockProtocolViewWrapper.vue` | Block protocol viewer     |
| `/network`        | `network`         | `NetworkInspectorView.vue`          | Network traffic inspector |
| `/editor`         | `editor`          | `EditorViewWrapper.vue`             | Code editor               |
| `/windows`        | `Editor`          | `WindowGeneralView.vue`             | Window management         |
| `/comhub`         | `comhub-overview` | `ComHubOverviewWrapper.vue`         | ComHub overview           |
| `/u/:endpoint_id` | `endpoint`        | `EndpointView.vue`                  | Endpoint details          |
| `/pointers`       | -                 | `PointerView.vue`                   | Pointer explorer          |
| `/repl`           | `repl`            | `DatexRepl.vue`                     | Interactive REPL          |

## Route Definitions

### Static Routes

Static routes import components directly:

```typescript
import WelcomeView from '@/views/WelcomeView.vue';
import WindowGeneralView from '@/views/WindowGeneralView.vue';

const routes = [
    {
        path: '/',
        name: 'welcome',
        component: WelcomeView,
    },
    {
        path: '/windows',
        name: 'Editor',
        component: WindowGeneralView,
    },
];
```

### Dynamic Routes

Dynamic routes use dynamic segments (`:`) for parameterized URLs:

```typescript
{
    path: '/u/:endpoint_id',
    name: 'endpoint',
    component: () => import('@/components/endpoint/EndpointView.vue'),
}
```

Access the parameter in the component:

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const endpointId = route.params.endpoint_id;
</script>
```

### Lazy-Loaded Routes

Most routes use dynamic imports for code splitting:

```typescript
{
    path: '/blocks',
    name: 'blocks',
    component: () => import('@/views/BlockViewer/DatexBlockProtocolViewWrapper.vue'),
},
```

Benefits:

- Smaller initial bundle size
- Faster initial page load
- Components loaded on demand