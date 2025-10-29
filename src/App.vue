<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderProvider from '@/components/HeaderProvider.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider
} from "@/components/ui/sidebar";

</script>

<template>
  <HeaderProvider/>
  <SidebarProvider>
    <Sidebar variant="inset">
      <SidebarHeader>DATEX sidebar</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <p>Sidebar content</p>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <RouterView/>
  </SidebarProvider>
</template>
