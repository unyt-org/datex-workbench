<template>
  <div class="h-full flex flex-col overflow-hidden p-5 bg-neutral-50 dark:bg-neutral-950">
    <!-- Title + search + settings -->
    <div class="flex items-center gap-2 mb-4">
      <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mr-2">ComHub</h2>

      <!-- Settings gear -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-56">
  <div class="flex items-center justify-between px-2 py-2">
    <span class="text-sm">Advanced Mode</span>
    <button
      role="switch"
      :aria-checked="advancedMode"
      @click="advancedMode = !advancedMode"
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
      :class="advancedMode ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'"
    >
      <span
        class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform"
        :class="advancedMode ? 'translate-x-4' : 'translate-x-0'"
      />
    </button>
  </div>
  <div class="flex items-center justify-between px-2 py-2">
    <span class="text-sm">Group by Endpoint</span>
    <button
      role="switch"
      :aria-checked="groupByEndpoint"
      @click="groupByEndpoint = !groupByEndpoint"
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
      :class="groupByEndpoint ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'"
    >
      <span
        class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform"
        :class="groupByEndpoint ? 'translate-x-4' : 'translate-x-0'"
      />
    </button>
  </div>
</DropdownMenuContent>
      </DropdownMenu>

      <!-- Search bar -->
      <div class="max-w-[300px] flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search endpoint identifier (e.g. @@...)"
          class="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <ComHubEndpointList
        v-if="groupByEndpoint"
        :interfaces="interfaces"
        :search-query="effectiveSearch"
        :advanced-mode="advancedMode"
      />
      <ComHubInterfaceList
        v-else
        :interfaces="interfaces"
        :search-query="effectiveSearch"
        :advanced-mode="advancedMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getComHubMetadata } from '@/lib/runtime'
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

// Don't treat bare '@' as a valid search
const effectiveSearch = computed(() => {
  const q = searchQuery.value.trim()
  if (q === '@') return ''
  return q
})

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