<template>
  <div class="h-full flex flex-col overflow-hidden p-5 bg-neutral-50 dark:bg-neutral-950">
    <!-- View toggle -->
    <div class="mb-4 flex items-center gap-2">
      <label class="text-sm text-neutral-500 cursor-pointer select-none flex items-center gap-2">
        <input type="checkbox" v-model="endpointView" class="accent-blue-500" />
        Group by Endpoint
      </label>
    </div>
    <div class="flex-1 overflow-hidden">
      <ComHubEndpointView v-if="endpointView" />
      <ComHubOverview v-else />
    </div>
  </div>
</template>

  <script setup lang="ts">
  import { ref } from 'vue'
  import ComHubOverview from '@/components/ComHubOverview.vue'
  import ComHubEndpointView from '@/components/ComHubEndpointView.vue'

  const endpointView = ref(false)
    </script>