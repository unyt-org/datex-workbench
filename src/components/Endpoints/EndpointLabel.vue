<script setup lang="ts">
import { useEndpointConnectionStatus } from '@/lib/composables/use-endpoint-connection-status.ts';
import type { Endpoint } from '../../lib/runtime-loader.ts';
import { computed, ref, watch } from 'vue';
import { connectedInspectorInstances } from '@/lib/inspector/mod.ts';

const props = defineProps<{
  endpoint: Endpoint,
  compact?: boolean
}>();

const { isConnected, connectionLostCount, endpointName, pollCount} = useEndpointConnectionStatus(() => props.endpoint);

const initialPollCount = ref(pollCount.value);
const initialConnectionLostCount = ref(connectionLostCount.value);

// when endpoint has changed, update the initial counts
watch(() => props.endpoint, () => {
  initialPollCount.value = pollCount.value;
  initialConnectionLostCount.value = connectionLostCount.value;
});

const hasInspectorSession = computed(() => connectedInspectorInstances.has(props.endpoint));

</script>

<template>
  <div class="flex items-start gap-2">
    <span v-if="isConnected" class="relative flex">
      <span :class="hasInspectorSession ? 'text-blue-400' : 'text-green-500'">●</span>
        <span
          v-if="pollCount != initialPollCount"
          :key="pollCount"
          class="absolute inline-flex h-full w-full animate-ping-once rounded-ful opacity-75"
          :class="hasInspectorSession ? 'text-blue-300' : 'text-green-400'">
          ●
        </span>
    </span>
    <span v-else class="relative flex">
      <span class="text-foreground">●</span>
      <span
          v-if="connectionLostCount != initialConnectionLostCount"
          :key="connectionLostCount"
          class="absolute inline-flex h-full w-full animate-ping-once-long rounded-full text-rose-400 opacity-75">
          ●
        </span>
    </span>

    <span>{{ endpoint.toString() }}</span>
    <span v-if="!compact" class="text-muted-foreground">
      {{ endpointName }}
    </span>
  </div>
</template>
