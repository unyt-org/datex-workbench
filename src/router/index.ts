import WindowGeneralView from '@/views/WindowGeneralView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },

    {
      path: '',
      name: 'Editor',
      component: WindowGeneralView,
    },
  ],
})

export default router
