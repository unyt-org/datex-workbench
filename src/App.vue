<script setup lang="ts">
import SideBar from '@/components/SideBar.vue';
import { Toaster } from '@/components/ui/sonner';
import { RouterLink } from 'vue-router';
import { RouterView } from 'vue-router';
import { Datex } from './lib/runtime';
import { InfoIcon, TriangleAlert } from 'lucide-vue-next';

const localPatch = localStorage.getItem('localDatexModuleUrl');

let localPatchHost: string | null;
try {
    localPatchHost = localPatch ? new URL(localPatch).host : null;
} catch {
    localPatchHost = localPatch;
}

const localDatexModuleUrlFailed = localStorage.getItem('localDatexModuleUrlFailed') === 'true';
const version = Datex.js_version;
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
        <Toaster :position="'top-center'" />

        <div v-if="!localDatexModuleUrlFailed && localPatchHost">
            <RouterLink
                :to="{ name: 'preferences' }"
                class="group absolute bottom-3 right-3 bg-blue-400/80 px-2 py-1 rounded text-sm z-50 flex items-center"
            >
                <InfoIcon class="inline-block size-4 mr-1" />
                <span
                    >Using <b>datex-web {{ version }}</b> from {{ localPatchHost }}</span
                >
            </RouterLink>
            <div
                class="w-screen h-screen border-2 border-blue-400 absolute left-0 top-0 pointer-events-none"
            ></div>
        </div>

        <div v-if="localDatexModuleUrlFailed">
            <RouterLink
                :to="{ name: 'preferences' }"
                class="absolute bottom-3 right-3 bg-rose-400/80 px-2 py-1 rounded text-sm z-50 flex items-center"
            >
                <TriangleAlert class="inline-block size-4 mr-1" />
                <span
                    >Failed to load <b>datex-web {{ version }}</b> from {{ localPatchHost }}</span
                >
            </RouterLink>
            <div
                class="w-screen h-screen border-2 border-rose-400 absolute left-0 top-0 pointer-events-none"
            ></div>
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
