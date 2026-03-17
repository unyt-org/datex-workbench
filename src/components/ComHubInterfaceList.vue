<template>
  <div>
    <div
      v-for="iface in filteredInterfaces"
      :key="iface.uuid"
      class="card hover:bg-neutral-200 dark:hover:bg-neutral-700/50 transition cursor-pointer"
    >
      <!-- Interface Header -->
      <div class="flex justify-between items-start gap-2">
        <div class="cursor-pointer flex-1" @click="toggle(iface.uuid)">
          <h3 class="font-semibold text-primary">
            {{ iface.properties?.interface_type || 'Unknown interface' }}
            <span v-if="iface.properties && iface.properties.name">({{ iface.properties.name }})</span>
          </h3>
          <div class="text-xs text-dim mt-1">
            Sockets: {{ iface.sockets.length }} • Channel: {{ iface.properties?.channel ?? 'unknown' }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-xs text-faint">RTT: {{ iface.properties?.round_trip_time ?? 'N/A' }} ms</div>
          <button
            v-if="advancedMode"
            @click.stop="disconnectInterface(iface.uuid)"
            class="btn-danger w-24 text-center mr-3"
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
          class="card-inner"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1 flex-1">
              <h4 class="font-semibold flex items-center gap-2">
                <span class="font-mono text-blue-600 dark:text-blue-400">{{ socket.endpoint }}</span>
                <span
                  v-if="socket.properties && socket.properties.is_direct"
                  class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                >direct</span>
                <span class="text-neutral-400">{{ getDirectionArrow(socket.direction) }}</span>
              </h4>
              <div class="text-xs text-dim mt-1">
                Distance: {{ socket.properties?.distance ?? 'N/A' }}
                • Created: {{ socket.properties?.known_since ? formatTime(socket.properties.known_since) : 'unknown' }}
              </div>
            </div>
            <button
              v-if="advancedMode"
              @click.stop="disconnectSocket(iface.uuid, socket.uuid, socket.endpoint)"
              class="btn-danger w-24 text-center"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredInterfaces.length === 0" class="text-sm text-dim">
      No matching endpoints found.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComHubInterface, ComHubSocket } from '@/components/ComHubOverviewWrapper.vue';
import { Datex } from '@/lib/runtime';
import { computed, reactive, watch } from 'vue';

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
      socket.endpoint.toLowerCase().includes(query))
      if (matchingSockets.length === 0) return null
      return { ...iface, sockets: matchingSockets }
    })
    .filter((iface): iface is ComHubInterface => iface !== null)
})
watch(filteredInterfaces, (ifaces) => {
  if (!props.searchQuery.trim()) return
  for (const iface of ifaces) {
    expanded[iface.uuid] = true
  }
})

watch(() => props.searchQuery, (val) => {
  if (!val.trim()) {
    Object.keys(expanded).forEach((key) => { expanded[key] = false })
  }
})

async function disconnectSocket(interfaceUuid: string, socketUuid: string, endpoint: string) {
  await Datex.comHub.removeSocket(socketUuid as `socket::${string}`)
  console.warn('[ComHub] disconnectSocket called', { interfaceUuid, socketUuid, endpoint })
}

async function disconnectInterface(interfaceUuid: string) {
  await Datex.comHub.removeInterface(interfaceUuid as `com_interface::${string}`)
}

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
  const elapsed = Math.floor((Date.now() - ms) / 1000)
  if (elapsed < 60) return rtf.format(-elapsed, 'second')
  const minutes = Math.floor(elapsed / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.floor(hours / 24), 'day')
}

</script>