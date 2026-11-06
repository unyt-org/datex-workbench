<script setup lang="ts">
import { useEndpointConnectionStatus } from '@/lib/composables/use-endpoint-connection-status.ts';
import type { Endpoint } from '../../lib/runtime-loader.ts';
const props = defineProps<{
  endpoint: Endpoint
}>();

const { isConnected, pollCount} = useEndpointConnectionStatus(() => props.endpoint);

</script>

<template>
  <div class="flex items-start gap-1">
    <span v-if="isConnected" class="relative flex">
      <span class="text-green-500">●</span>
        <span
      :key="pollCount"
      class="absolute inline-flex h-full w-full animate-ping-once rounded-full text-green-400 opacity-75">●</span>
    </span>
    <span v-else class="text-foreground">●</span>

    <span>{{ endpoint.toString() }}</span>
  </div>
</template>
