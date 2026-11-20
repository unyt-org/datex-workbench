<script setup lang="ts">
import { getAllPointers } from '@/lib/memory';
import ValueView from './ValueView.vue';
import StandaloneWindowHeader from '../Endpoints/StandaloneWindowHeader.vue';
import { useWindowControlsOverlay } from '@/utils/windowControlsOverlay.ts';
import EndpointSearch from '../Endpoints/EndpointSearch.vue';
const pointers = getAllPointers();

function normalizeAdress(address: string) {
    return address;
}

const controlsOverlayEnabled = useWindowControlsOverlay();
</script>

<template>
    <StandaloneWindowHeader :title="'Memory Inspector'" />

    <div class="bg-background text-foreground flex h-full flex-col gap-3 p-4 overflow-hidden">
        <div v-if="!controlsOverlayEnabled" class="flex items-center gap-2 justify-between">
            <h1 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">
                Memory Inspector
            </h1>

            <div>
                <EndpointSearch />
            </div>
        </div>
        <div class="overflow-y-auto mt-3 flex flex-col gap-3">
            <div v-for="[address, value] in pointers" :key="address" class="bg-card p-2 rounded-md">
                <div class="flex flex-col items-start gap-2">
                    <span class="font-mono text-sm text-muted-foreground min-w-md"
                        >${{ normalizeAdress(address) }}</span
                    >
                    <div class="bg-background border p-3 rounded-sm w-full">
                        <ValueView :value="value.value.deref()!" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
