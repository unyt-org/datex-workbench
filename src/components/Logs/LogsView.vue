<template>
    <div class="bg-page flex h-full flex-col overflow-hidden p-5 top-offset">
        <div class="mb-4 flex items-center gap-2">
            <h2 class="mr-2 text-lg mb-3 font-medium text-neutral-900 dark:text-neutral-100">
                Logs
            </h2>
        </div>
        <div>
            {{ currentInspectorName }}
            <div v-for="log in currentInspectorLogsList" :key="log.message">
                {{ log.message }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, ref  } from 'vue';
import { activeInspector } from '@/lib/inspector/mod.ts';
import type { LogMessage } from '@/lib/_temp_types';
const currentInspectorLogsList = ref<LogMessage[]>([]);
const currentInspectorName = ref<string|null>(null);

watch(activeInspector, async (newInspector) => {
  console.log("new inspector", newInspector)
  currentInspectorName.value = await newInspector.name();

  const logStream = await newInspector.logs();
  for await (const log of logStream) {
    currentInspectorLogsList.value.push(log);
  }
}, {immediate: true});
</script>
