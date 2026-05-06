<script setup lang="ts">
import SideBar from '@/components/SideBar.vue';
import { RouterView } from 'vue-router';
</script>

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
    </div>
</template>

<style scoped>
@media (display-mode: window-controls-overlay) {
    .main {
        -webkit-app-region: drag;
    }
}
</style>
