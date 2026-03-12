<template>
  <div>
    <div
      v-for="[endpointId, sockets] in filteredEndpoints"
      :key="endpointId"
      class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 mb-3 bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-neutral-100"
    >
      <!-- Endpoint Header -->
      <div class="flex justify-between items-center cursor-pointer" @click="toggle(endpointId)">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-sm font-mono text-blue-600 dark:text-blue-400">{{ endpointId }}</h3>
            <span
              v-if="isDirect(sockets)"
              class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >direct</span>
          </div>
          <div class="text-xs text-neutral-500">
            Connected via {{ sockets.length }} {{ sockets.length === 1 ? 'socket' : 'sockets' }}
            {{ getEndpointDirection(sockets) }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="advancedMode"
            @click.stop="sockets[0] && disconnectInterface(sockets[0].interface.uuid)"
            class="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition"
          >
            Disconnect
          </button>
          <span class="text-neutral-400 text-xs">{{ expanded[endpointId] ? '▾' : '▸' }}</span>
        </div>
      </div>

      <!-- Expanded Socket List -->
      <div v-if="expanded[endpointId]" class="mt-3 border-t pt-3 flex flex-col gap-2">
        <div
          v-for="(socket, idx) in sockets"
          :key="socket.uuid + idx"
          class="text-sm p-3 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 flex-1">
              <h4 class="font-semibold text-sm">
                {{ socket.interface.properties.interface_type }}
                <span v-if="socket.interface.properties.name" class="font-normal text-neutral-500">
                  ({{ socket.interface.properties.name }})
                </span>
              </h4>
              <div class="text-xs text-neutral-400 font-mono mt-0.5">{{ socket.uuid }}</div>
              <div class="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                <span>Known since {{ formatTime(socket.properties.known_since) }}</span>
                <span>·</span>
                <span>Distance: {{ socket.properties.distance }}</span>
                <span
                  v-if="socket.properties.is_direct"
                  class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                >direct</span>
              </div>
            </div>
            <button
              v-if="advancedMode"
              @click.stop="disconnectSocket(socket.interface.uuid, socket.uuid, endpointId)"
              class="shrink-0 text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredEndpoints.length === 0" class="text-sm text-neutral-500">
      No matching endpoints found.
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { Datex } from '@/lib/runtime'
import type { ComHubInterface, ComHubSocket } from '@/components/ComHubOverviewWrapper.vue'

interface SocketWithInterface extends ComHubSocket {
  interface: {
    uuid: string
    properties: ComHubInterface['properties']
  }
}

const props = defineProps<{
  interfaces: ComHubInterface[]
  searchQuery: string
  advancedMode: boolean
}>()

const expanded = reactive<Record<string, boolean>>({})

const endpointMap = computed((): Map<string, SocketWithInterface[]> => {
  const map = new Map<string, SocketWithInterface[]>()
  for (const iface of props.interfaces) {
    for (const socket of iface.sockets) {
      const entry: SocketWithInterface = {
        ...socket,
        interface: { uuid: iface.uuid, properties: iface.properties },
      }
      if (!map.has(socket.endpoint)) map.set(socket.endpoint, [])
      map.get(socket.endpoint)!.push(entry)
    }
  }
  return map
})

const filteredEndpoints = computed((): [string, SocketWithInterface[]][] => {
  const query = props.searchQuery.trim().toLowerCase()
  const entries = Array.from(endpointMap.value.entries())
  if (!query) return entries
  return entries.filter(([endpointId]) => endpointId.toLowerCase().includes(query))
})

watch(filteredEndpoints, (entries) => {
  if (!props.searchQuery.trim()) return
  for (const [endpointId] of entries) {
    expanded[endpointId] = true
  }
})

watch(() => props.searchQuery, (val) => {
  if (!val.trim()) {
    Object.keys(expanded).forEach((key) => { expanded[key] = false })
  }
})

function toggle(endpointId: string) {
  expanded[endpointId] = !expanded[endpointId]
}

function getEndpointDirection(sockets: SocketWithInterface[]): string {
  const dirs = new Set(sockets.map((s) => s.direction))
  if (dirs.has('InOut')) return '↔'
  if (dirs.has('In') && dirs.has('Out')) return '↔'
  if (dirs.has('In')) return '←'
  if (dirs.has('Out')) return '→'
  return '↔'
}

function isDirect(sockets: SocketWithInterface[]): boolean {
  return sockets.some((s) => s.properties.is_direct)
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
}
</script>