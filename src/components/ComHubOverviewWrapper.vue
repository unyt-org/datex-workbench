<template>
    <div class="m-5">
      <!-- Tab Toggle -->
      <div class="flex gap-1 mb-4 border-b dark:border-neutral-700">
        <button
          class="px-3 py-1.5 text-sm font-medium transition"
          :class="activeTab === 'interface'
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'"
          @click="activeTab = 'interface'"
        >
          By Interface
        </button>
        <button
          class="px-3 py-1.5 text-sm font-medium transition"
          :class="activeTab === 'endpoint'
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'"
          @click="activeTab = 'endpoint'"
        >
          By Endpoint
        </button>
      </div>
  
      <ComHubOverview v-if="activeTab === 'interface'" />
      <ComHubEndpointView v-else />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import ComHubOverview from '@/components/ComHubOverview.vue'
  import ComHubEndpointView from '@/components/ComHubEndpointView.vue'
  
  const activeTab = ref<'interface' | 'endpoint'>('interface')
  </script>