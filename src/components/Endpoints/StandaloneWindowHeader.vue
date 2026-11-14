<script setup lang="ts">
import { cn } from '@/lib/utils.ts';
import EndpointSearch from './EndpointSearch.vue';
import { useWindowControlsOverlay } from '@/utils/windowControlsOverlay';

defineProps<{
  alwaysVisible?: boolean,
  title?: string
}>();

const controlsOverlayEnabled = useWindowControlsOverlay();

</script>

<template>
  <div
    :class="cn('drag pt-px flex items-center w-full justify-between pr-[var(--titlebar-right-inset)] pl-[var(--titlebar-left-inset)]', {
        'p-4': !controlsOverlayEnabled,
        'hidden': !controlsOverlayEnabled && !alwaysVisible
    })"
  >
      <div class="text-sm">{{ title }}</div>
      <EndpointSearch :noBorder="controlsOverlayEnabled"/>
    </div>
</template>

<style scoped>
</style>
