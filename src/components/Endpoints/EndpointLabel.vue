<script setup lang="ts">
import { useEndpointConnectionStatus } from '@/lib/composables/use-endpoint-connection-status.ts';
import type { Endpoint } from "@/lib/runtime-loader";
import { computed, ref, watch } from 'vue';
import { connectedInspectorInstances } from '@/lib/inspector/mod.ts';
import TooltipWrapper from '../NetworkInspector/TooltipWrapper.vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const props = defineProps<{
  endpoint: Endpoint,
  compact?: boolean,
  variant?: "colored-name" | "compact" | "default"
}>();

const { isConnected, connectionLostCount, endpointName, pollCount, refresh} = useEndpointConnectionStatus(() => props.endpoint);

const initialPollCount = ref(pollCount.value);
const initialConnectionLostCount = ref(connectionLostCount.value);

const statusText = computed(() => {
  if (isConnected.value) {
    return hasInspectorSession.value ? 'Connected with inspector session' : 'Connected';
  } else {
    return showDisconnectedAsError.value ? 'Disconnected (error)' : 'Disconnected';
  }
});

const textColor = computed(() => {
  if (isConnected.value) {
    return hasInspectorSession.value ? 'text-blue-400' : 'text-green-500';
  } else {
    return showDisconnectedAsError.value ? 'text-rose-500' : 'text-foreground';
  }
});

// when endpoint has changed, update the initial counts
watch(() => props.endpoint, () => {
  initialPollCount.value = pollCount.value;
  initialConnectionLostCount.value = connectionLostCount.value;
});
const hasInspectorSession = computed(() => connectedInspectorInstances.has(props.endpoint));
const showDisconnectedAsError = computed(() => hasInspectorSession.value);
</script>

<template>
  <div class="flex items-start gap-2" :class="variant == 'colored-name' ? 'flex-row-reverse justify-between' : ''">
    <span class="relative flex cursor-pointer select-none" @click="refresh(); $event.stopPropagation()">
      <span :class="textColor">●</span>
      <span
        v-if="connectionLostCount != initialConnectionLostCount"
        :key="connectionLostCount"
        class="absolute inline-flex h-full w-full animate-ping-once-long rounded-full opacity-75"
        :class="textColor">
        ●
      </span>
       <span
        v-if="isConnected && pollCount != initialPollCount"
        :key="pollCount"
        class="absolute inline-flex h-full w-full animate-ping-once rounded-ful opacity-75"
        :class="textColor">
        ●
      </span>
    </span>

    <span>
      <span :class="variant == 'colored-name' ? textColor : ''">{{ endpoint.toString() }}</span>
      <span v-if="variant != 'compact'" :class="variant == 'colored-name' ? 'text-foreground' : 'text-muted-foreground'">
        &nbsp;{{ endpointName }}
      </span>
    </span>
  </div>
</template>
