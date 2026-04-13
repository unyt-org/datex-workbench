<script setup lang="ts">
// import HeaderProvider from '@/components/HeaderProvider.vue'; // header is commented, bc everything is moved from header to SideBar
import SideBar from '@/components/SideBar.vue';
import { RouterView } from 'vue-router';
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
        <div class="flex grow overflow-hidden">
            <!-- SideBar -->
            <SideBar class="z-53 flex-none" />
            <!-- z must be 50+, bc 50 is the highest z index on website-->

            <main class="main relative flex-1 overflow-hidden">
                <!-- Header -->
                <!-- <HeaderProvider class="z-10 flex-none" /> -->

                <!-- Main content area -->
                <Suspense>
                    <RouterView />
                </Suspense>
            </main>
        </div>
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
        <!-- </div> -->
    </div>
</template>

<style scoped>
/* optional: prevent scrollbars in sidebars */
:deep(.sidebar-content) {
    /* overflow-y: auto; */
}

@media (display-mode: window-controls-overlay) {
    .main {
        margin-top: env(titlebar-area-height, 48px);
    }
}
</style>
