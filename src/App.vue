<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
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
import { getPointers, type DIF } from '@/lib/runtime'

// Get pointers from runtime
const pointers = ref<Map<string, DIF.Definitions.DIFContainer>>(new Map())

onMounted(() => {
  pointers.value = getPointers()
})
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
