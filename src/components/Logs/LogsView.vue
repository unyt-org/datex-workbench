
<script setup lang="ts">
import { AnsiUp } from 'ansi_up'

import { watch, ref  } from 'vue';
import { activeInspector } from '@/lib/inspector/mod.ts';
import type { LogMessage } from '@/lib/_temp_types';

const ansiUp = new AnsiUp()
ansiUp.use_classes = false


const currentInspectorLogsList = ref<LogMessage[]>([]);


watch(activeInspector, async (newInspector) => {
  console.log("new inspector", newInspector)

  const logStream = await newInspector.logs();
  for await (const log of logStream) {
    currentInspectorLogsList.value.push(log);
  }
}, {immediate: true});
</script>


<template>
    <div class="bg-page flex h-full flex-col overflow-hidden p-5 top-offset">
        <div class="mb-4 flex items-center gap-2">
            <h2 class="mr-2 text-lg mb-3 font-medium text-neutral-900 dark:text-neutral-100">
                Logs
            </h2>
        </div>
        <div class="flex flex-col gap-1 font-mono">
            <div v-for="log in currentInspectorLogsList" :key="log.message" class="flex gap-2">
                <span v-if="log.module" class="text-muted-foreground">{{ log.module }}</span>
                <span v-if="log.tag" class="bg-foreground text-background px-2 rounded">{{ log.tag }}</span>
                <pre v-html="ansiUp.ansi_to_html(log.message)"></pre>
            </div>
        </div>
    </div>
</template>
