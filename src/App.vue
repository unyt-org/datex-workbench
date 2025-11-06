<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderProvider from '@/components/HeaderProvider.vue'
import PointerView from '@/components/PointerView.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'

// ========================================
// 🎨 Sample Data for Testing PointerView
// ========================================
// This matches the design from your screenshot
const samplePointers = [
  {
    id: 'dept-1',
    label: 'Departments',
    path: '/departments',
    children: [
      {
        id: 'electronics',
        label: 'Electronics',
        path: '/departments/electronics',
        children: [
          {
            id: 'mobile-div',
            label: 'Mobile Division',
            path: '/departments/electronics/mobile',
            children: [
              {
                id: 'john-doe',
                label: 'John Doe',
                path: '/employees/john-doe',
                valuePreview: '#10b981', // Green color
              },
              {
                id: 'nucky-thompson',
                label: 'Nucky Thompson',
                path: '/employees/nucky-thompson',
                valuePreview: '#f59e0b', // Orange color
              },
              {
                id: 'nucky-thompson',
                label: 'Nucky Thompson',
                path: '/employees/nucky-thompson',
                valuePreview: '#f59e0b', // Orange color
              },
              {
                id: 'nucky-thompson',
                label: 'Nucky Thompson',
                path: '/employees/nucky-thompson',
                valuePreview: '#f59e0b', // Orange color
              },
              {
                id: 'nucky-thompson',
                label: 'Nucky Thompson',
                path: '/employees/nucky-thompson',
                valuePreview: '#f59e0b', // Orange color
              }
            ]
          },
          {
            id: 'laptop',
            label: 'Laptop',
            path: '/departments/electronics/laptop',
          },
          {
            id: 'monitors',
            label: 'Monitors',
            path: '/departments/electronics/monitors',
          },
          {
            id: 'monitors',
            label: 'Monitors',
            path: '/departments/electronics/monitors',
          },
          {
            id: 'monitors',
            label: 'Monitors',
            path: '/departments/electronics/monitors',
          },
          {
            id: 'monitors',
            label: 'Monitors',
            path: '/departments/electronics/monitors',
          },
          {
            id: 'monitors',
            label: 'Monitors',
            path: '/departments/electronics/monitors',
          }
        ]
      },
      {
        id: 'food-beverage',
        label: 'Food & Beverage',
        path: '/departments/food-beverage',
        children: [
          {
            id: 'grocery',
            label: 'Grocery & Gourmet Food',
            path: '/departments/food-beverage/grocery',
          }
        ]
      },
      {
        id: 'health-beauty',
        label: 'Health & Beauty',
        path: '/departments/health-beauty',
      },
      {
        id: 'home-kitchen',
        label: 'Home & Kitchen',
        path: '/departments/home-kitchen',
      },
      {
        id: 'home-improvement',
        label: 'Home Improvement',
        path: '/departments/home-improvement',
      },
      {
        id: 'industrial',
        label: 'Industrial & Scientific',
        path: '/departments/industrial',
      },
      {
        id: 'office',
        label: 'Office Products',
        path: '/departments/office',
      },
      {
        id: 'patio',
        label: 'Patio lawn & Garden',
        path: '/departments/patio',
      },
      {
        id: 'pet',
        label: 'Pet Supplies',
        path: '/departments/pet',
      },
      {
        id: 'sports',
        label: 'Sports & Outdoors',
        path: '/departments/sports',
      }
    ]
  }
]
</script>

<!-- <template>
  <HeaderProvider />
  <SidebarProvider>
    <RouterView />
    <Suspense>
      <DatexBlockProtocolViewer />
    </Suspense>
  </SidebarProvider>
</template> -->

<template>
    <div class="flex h-screen flex-col">
        <!-- Header -->
        <HeaderProvider class="z-10 flex-none" />

        <!-- Main area: below header -->
        <!--    <div class="flex flex-1 overflow-hidden mt-40">-->
        <!--      &lt;!&ndash; Left sidebar &ndash;&gt;-->
        <!--      <SidebarProvider>-->
        <!--        <Sidebar side="left" class="flex-none w-64 border-r border-gray-800" variant="inset" open="false">-->
        <!--          <SidebarHeader>Left Sidebar</SidebarHeader>-->
        <!--          <SidebarContent>-->
        <!--            <SidebarGroup>-->
        <!--              <p>Navigation</p>-->
        <!--            </SidebarGroup>-->
        <!--          </SidebarContent>-->
        <!--        </Sidebar>-->
        <!--      </SidebarProvider>-->

        <!-- Main content area -->
        <div class="flex-1 overflow-hidden bg-gray-900 text-white">
            <Suspense>
                <RouterView />
            </Suspense>
        </div>

        <!-- Right sidebar -->
        <!--      <SidebarProvider>-->
        <!--        <Sidebar side="right" class="flex-none w-72 border-l border-gray-800" variant="inset">-->
        <!--          <SidebarHeader>Right Sidebar</SidebarHeader>-->
        <!--          <SidebarContent>-->
        <!--            <SidebarGroup>-->
        <!--              <p>Details</p>-->
        <!--            </SidebarGroup>-->
        <!--          </SidebarContent>-->
        <!--        </Sidebar>-->
        <!--      </SidebarProvider>-->
        <!--    </div>-->
    </div>
</template>

<style scoped>
/* optional: prevent scrollbars in sidebars */
:deep(.sidebar-content) {
    /* overflow-y: auto; */
}
</style>
