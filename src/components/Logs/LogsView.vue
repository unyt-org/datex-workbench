<script setup lang="ts">
import { AnsiUp } from 'ansi_up';

import { watch, ref } from 'vue';
import { activeInspector } from '@/lib/inspector/mod.ts';
import Checkbox from '../ui/checkbox/Checkbox.vue';
import { useWindowControlsOverlay } from '@/utils/windowControlsOverlay.ts';
import StandaloneWindowHeader from '../Endpoints/StandaloneWindowHeader.vue';
import EndpointSearch from '../Endpoints/EndpointSearch.vue';
import type { LogMessage } from '@unyt/datex';

const ansiUp = new AnsiUp();
ansiUp.use_classes = false;

const showModules = ref(true);
const showTimestamps = ref(true);

const currentInspectorLogsList = ref<{ time: Date; log: LogMessage }[]>([]);
const controlsOverlayEnabled = useWindowControlsOverlay();

watch(
    activeInspector,
    async (newInspector) => {
        if (!newInspector) return;
        const logStream = await newInspector.logs();
        for await (const log of logStream) {
            currentInspectorLogsList.value.push({ time: new Date(), log });
        }
    },
    { immediate: true },
);
</script>

<template>
    <StandaloneWindowHeader :title="'Logs'" />

    <div class="bg-page flex h-full flex-col overflow-hidden p-4">
        <div class="mb-4 flex items-center gap-2 justify-between">
            <h2
                v-if="!controlsOverlayEnabled"
                class="mr-2 text-xl font-medium text-neutral-900 dark:text-neutral-100"
            >
                Logs
            </h2>

            <div class="flex items-center gap-7">
                <div class="flex gap-5">
                    <!--Settings-->
                    <label class="flex items-center gap-2">
                        <Checkbox v-model="showModules" />
                        Show Modules
                    </label>
                    <label class="flex items-center gap-2">
                        <Checkbox v-model="showTimestamps" />
                        Show Timestamps
                    </label>
                </div>

                <div v-if="!controlsOverlayEnabled">
                    <EndpointSearch />
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-1 font-mono overflow-auto">
            <div
                v-for="logEntry in currentInspectorLogsList"
                :key="logEntry.log.message"
                class="flex gap-2"
            >
                <span v-if="showTimestamps" class="text-muted-foreground"
                    >[{{ logEntry.time.toLocaleString() }}]</span
                >
                <span v-if="showModules && logEntry.log.module" class="text-muted-foreground">{{
                    logEntry.log.module
                }}</span>
                <span v-if="logEntry.log.tag" class="bg-foreground text-background px-2 rounded">{{
                    logEntry.log.tag
                }}</span>
                <pre v-html="ansiUp.ansi_to_html(logEntry.log.message)"></pre>
            </div>
        </div>
    </div>
</template>
