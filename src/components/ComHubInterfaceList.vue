<template>
  <div>
    <div
      v-for="iface in filteredInterfaces"
      :key="iface.uuid"
      class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 mb-3 bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-neutral-100"
    >
      <!-- Interface Header -->
      <div class="flex justify-between items-center">
        <div class="cursor-pointer flex-1" @click="toggle(iface.uuid)">
          <h3 class="font-semibold">
            {{ iface.properties.interface_type }}
            <span v-if="iface.properties.name">({{ iface.properties.name }})</span>
          </h3>
          <div class="text-xs text-neutral-500 mt-1">
            Sockets: {{ iface.sockets.length }} • Channel: {{ iface.properties.channel }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-xs text-neutral-400">RTT: {{ iface.properties.round_trip_time }} ms</div>
          <button
            v-if="advancedMode"
            @click.stop="disconnectInterface(iface.uuid)"
            class="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition"
          >
            Disconnect
          </button>
        </div>
      </div>

      <!-- Expanded Socket List -->
      <div v-if="expanded[iface.uuid]" class="mt-3 border-t pt-3 flex flex-col gap-3">
        <div
          v-for="socket in getSortedSockets(iface.sockets)"
          :key="socket.uuid + socket.endpoint"
          class="text-sm p-3 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 flex-1">
              <h4 class="font-semibold flex items-center gap-2">
                <span class="font-mono text-blue-600 dark:text-blue-400">{{ socket.endpoint }}</span>
                <span
                  v-if="socket.properties.is_direct"
                  class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                >direct</span>
                <span class="text-neutral-400">{{ getDirectionArrow(socket.direction) }}</span>
              </h4>
              <div class="text-xs text-neutral-500 mt-1">
                Distance: {{ socket.properties.distance }}
                • Created: {{ formatTime(socket.properties.known_since) }}
              </div>
            </div>
            <button
              v-if="advancedMode"
              @click.stop="disconnectSocket(iface.uuid, socket.uuid, socket.endpoint)"
              class="shrink-0 text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredInterfaces.length === 0" class="text-sm text-neutral-500">
      No matching endpoints found.
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { Datex } from '@/lib/runtime'
import type { ComHubInterface, ComHubSocket } from '@/components/ComHubOverviewWrapper.vue'

const props = defineProps<{
  interfaces: ComHubInterface[]
  searchQuery: string
  advancedMode: boolean
}>()

const expanded = reactive<Record<string, boolean>>({})

const filteredInterfaces = computed(() => {
  const query = props.searchQuery.trim().toLowerCase()
  if (!query) return props.interfaces
  return props.interfaces
    .map((iface) => {
      const matchingSockets = iface.sockets.filter((socket) =>
        socket.endpoint.toLowerCase().includes(query)
      )
      if (matchingSockets.length === 0) return null
      expanded[iface.uuid] = true
      return { ...iface, sockets: matchingSockets }
    })
    .filter((iface): iface is ComHubInterface => iface !== null)
})

watch(() => props.searchQuery, (val) => {
  if (!val.trim()) {
    Object.keys(expanded).forEach((key) => { expanded[key] = false })
  }
})

function toggle(uuid: string) {
  expanded[uuid] = !expanded[uuid]
}

function getSortedSockets(sockets: ComHubSocket[]) {
  return [...sockets].sort((a, b) => {
    if (a.properties.is_direct !== b.properties.is_direct) return a.properties.is_direct ? -1 : 1
    return a.properties.known_since - b.properties.known_since
  })
}

function getDirectionArrow(direction: string): string {
  if (direction === 'InOut') return '↔'
  if (direction === 'In') return '←'
  if (direction === 'Out') return '→'
  return ''
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.floor(hours / 24), 'day')
}

async function disconnectSocket(interfaceUuid: string, socketUuid: string, endpoint: string) {
  await Datex.comHub.removeSocket(socketUuid as `socket::${string}`)
  console.warn('[ComHub] disconnectSocket called', { interfaceUuid, socketUuid, endpoint })
}

async function disconnectInterface(interfaceUuid: string) {
  await Datex.comHub.removeInterface(interfaceUuid as `com_interface::${string}`)
  console.warn('[ComHub] disconnectInterface called', { interfaceUuid })
}
</script>