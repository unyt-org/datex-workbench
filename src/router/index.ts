import PointerView from '@/components/PointerView.vue';
import { getPointers } from '@/lib/runtime';
import WindowGeneralView from '@/views/WindowGeneralView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: WelcomeView,
        },
        {
            path: '/blocks',
            name: 'blocks',
            component: () => import('@/views/BlockViewer/DatexBlockProtocolViewWrapper.vue'),
        },
        {
            path: '/network',
            name: 'network',
            component: () => import('@/views/NetworkInspector/NetworkInspectorView.vue'),
        },
        {
            path: '/node-view',
            name: 'node view',
            component: () => import('@/views/TreeView.vue'),
        },
        // {
        //     path: '/editor',
        //     name: 'editor',
        //     component: () => import('@/views/Editor/EditorViewWrapper.vue'),
        // },
        {
            path: '/windows',
            name: 'Editor',
            component: WindowGeneralView,
        },
        {
            path: '/comhub',
            name: 'comhub-overview',
            component: () => import('@/components/ComHubOverviewWrapper.vue'),
        },
        {
            path: '/u/:endpoint_id',
            name: 'endpoint',
            component: () => import('@/components/endpoint/EndpointView.vue'),
        },
        {
            path: '/pointers',
            component: () => PointerView,
            props: { pointers: getPointers() },
        },
        {
            path: '/repl',
            name: 'repl',
            component: () => import('@/views/Repl/DatexRepl.vue'),
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
      },
    ],
});

export default router;
