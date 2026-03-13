import PointerView from '@/components/PointerView.vue';
import { getPointers } from '@/lib/runtime';
import WindowGeneralView from '@/views/WindowGeneralView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
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
    { path: '/editor',
      name: 'editor',
      component: () => import('@/views/Editor/EditorViewWrapper.vue'),
    },
    {
      path: '',
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
    }
  ],
});

export default router;
