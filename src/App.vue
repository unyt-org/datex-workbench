<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderProvider from '@/components/HeaderProvider.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar'
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <HeaderProvider class="flex-none z-10" />

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
      <RouterView />
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
  //overflow-y: auto;
}
</style>
