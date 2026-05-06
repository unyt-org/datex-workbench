import PointerView from '@/components/PointerView.vue';
import { getPointers } from '@/lib/runtime';
import WindowGeneralView from '@/views/WindowGeneralView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import WelcomeView from '../views/WelcomeView.vue';
import DatexRepl from '@/views/Repl/DatexRepl.vue';
import AboutView from '@/views/AboutView.vue';
import NetworkTraceView from '@/views/NetworkTrace/NetworkTraceView.vue';
import ComHubOverviewWrapper from '@/components/ComHubOverviewWrapper.vue';
import EndpointView from '@/components/endpoint/EndpointView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: WelcomeView,
        },
        {
            path: '/block',
            name: 'block',
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
            component: ComHubOverviewWrapper,
        },
        {
            path: '/u/:endpoint_id',
            name: 'endpoint',
            component: EndpointView,
        },
        {
            path: '/pointers',
            component: PointerView,
            props: { pointers: getPointers() },
        },
        {
            path: '/repl',
            name: 'repl',
            component: DatexRepl,
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
        {
            path: '/network-visualizer',
            name: 'network-visualizer',
            component: NetworkTraceView,
        },
  ],
});

export default router;
