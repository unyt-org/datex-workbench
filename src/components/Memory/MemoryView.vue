<template>
    <div class="bg-page flex h-full flex-col overflow-hidden p-5 top-offset">
        <div class="mb-4 flex items-center gap-2">
            <h2 class="mr-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Memory Inspector
            </h2>
        </div>
        <div>
            <div v-for="[address, value] in pointers" :key="address" class="mb-2">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-sm text-muted-foreground">${{ address }}</span>
                    <ValueView :value="value.value.deref()" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAllPointers } from '@/lib/memory';
import ValueView from './ValueView.vue';
const pointers = getAllPointers();
</script>
