<template>
  <div class="h-full flex flex-col overflow-hidden p-5 bg-neutral-50 dark:bg-neutral-950">
    <!-- Title + endpoint badge -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">ComHub</h2>
      <span class="text-xs font-mono px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">
        {{ String(Datex.endpoint) }}
      </span>
    </div>

    <!-- Search bar -->
    <div class="mb-4 max-w-[300px]">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search endpoint identifier (e.g. @@...)"
        class="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Toggles -->
    <div class="mb-4 flex flex-col gap-2">
      <label class="text-sm text-neutral-500 cursor-pointer select-none flex items-center gap-2">
        <input type="checkbox" v-model="advancedMode" class="accent-blue-500" />
        Advanced Mode
      </label>
      <label class="text-sm text-neutral-500 cursor-pointer select-none flex items-center gap-2">
        <input type="checkbox" v-model="groupByEndpoint" class="accent-blue-500" />
        Group by Endpoint
      </label>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <ComHubEndpointList
        v-if="groupByEndpoint"
        :interfaces="interfaces"
        :search-query="searchQuery"
        :advanced-mode="advancedMode"
      />
      <ComHubInterfaceList
        v-else
        :interfaces="interfaces"
        :search-query="searchQuery"
        :advanced-mode="advancedMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Datex, getComHubMetadata } from '@/lib/runtime'
import ComHubInterfaceList from '@/components/ComHubInterfaceList.vue'
import ComHubEndpointList from '@/components/ComHubEndpointList.vue'

interface InterfaceProperties {
  name?: string
  interface_type?: string
  channel?: string
  direction?: string
  round_trip_time?: number
  max_bandwidth?: number
  [key: string]: unknown
}

export interface ComHubSocket {
  uuid: string
  direction: string
  endpoint: string
  properties: {
    known_since: number
    distance: number
    is_direct: boolean
    channel_factor: number
    direction: string
  }
}

export interface ComHubInterface {
  uuid: string
  properties: InterfaceProperties
  sockets: ComHubSocket[]
  is_waiting_for_socket_connections?: boolean
}

const searchQuery = ref('')
const advancedMode = ref(false)
const groupByEndpoint = ref(false)
const interfaces = ref<ComHubInterface[]>([])

function syncMetadata() {
  interfaces.value = getComHubMetadata().interfaces as ComHubInterface[]
}

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  syncMetadata()
  intervalId = setInterval(syncMetadata, 2000)
})

onUnmounted(() => {
  if (intervalId !== null) clearInterval(intervalId)
})
</script>