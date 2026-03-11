<template>
    <div class="h-full overflow-auto">
      <h2 class="text-lg font-semibold mb-3">ComHub Endpoints</h2>

      <!-- Search Bar -->
      <div class="mb-4 w-1/2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search endpoint identifier (e.g. @@...)"
          class="w-full px-3 py-2 text-sm rounded border bg-white dark:bg-neutral-900 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Endpoint Cards -->
      <div
        v-for="[endpointId, sockets] in filteredEndpoints"
        :key="endpointId"
        class="border rounded-lg p-3 mb-3 bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-neutral-100"
      >
        <!-- Endpoint Header -->
        <div
          class="flex justify-between items-center cursor-pointer"
          @click="toggle(endpointId)"
        >
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-sm font-mono text-blue-600 dark:text-blue-400">{{ endpointId }}</h3>

              <!-- Direct badge -->
              <span
                v-if="isDirect(sockets)"
                class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              >
                direct
              </span>
            </div>

            <div class="text-xs text-neutral-500">
              Connected via {{ sockets.length }} {{ sockets.length === 1 ? 'socket' : 'sockets' }}
              {{ getEndpointDirection(sockets) }}
            </div>
          </div>

          <span class="text-neutral-400 text-xs">{{ expanded[endpointId] ? '▾' : '▸' }}</span>
        </div>

        <!-- Expanded Socket List -->
        <div v-if="expanded[endpointId]" class="mt-3 border-t pt-3 flex flex-col gap-2">
          <div
            v-for="(socket, idx) in sockets"
            :key="socket.uuid + idx"
            class="text-sm p-3 rounded bg-neutral-100 dark:bg-neutral-800"
          >
            <!-- Interface type + name -->
            <h4 class="font-semibold text-sm">
              {{ socket.interface.properties.interface_type }}
              <span v-if="socket.interface.properties.name" class="font-normal text-neutral-500">
                ({{ socket.interface.properties.name }})
              </span>
            </h4>

            <!-- Socket UUID -->
            <div class="text-xs text-neutral-400 font-mono mt-0.5">
              {{ socket.uuid }}
            </div>

            <!-- Known since + distance -->
            <div class="text-xs text-neutral-500 mt-1 flex items-center gap-2">
              <span>Known since {{ formatTime(socket.properties.known_since) }}</span>
              <span>·</span>
              <span>Distance: {{ socket.properties.distance }}</span>

              <!-- Direct badge on socket level -->
              <span
                v-if="socket.properties.is_direct"
                class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              >
                direct
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredEndpoints.length === 0"
        class="text-sm text-neutral-500"
      >
        No matching endpoints found.
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { reactive, ref, computed, watch } from 'vue'

  // ---- Types ----

  interface InterfaceProperties {
    interface_type?: string
    channel?: string
    name?: string
    direction?: string
    round_trip_time?: number
    max_bandwidth?: number
    [key: string]: unknown
  }

  interface ComHubInterface {
    uuid: string
    properties: InterfaceProperties
    sockets: RawSocket[]
    is_waiting_for_socket_connections?: boolean
  }

  interface RawSocket {
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

  interface SocketWithInterface extends RawSocket {
    interface: {
      uuid: string
      properties: InterfaceProperties
    }
  }

  // ---- Mock data (same as ComHubOverview) ----
  // TODO: Replace with live ComHub runtime state

  const comhub = reactive({
    endpoint: '@@FB2D5CF3FBE8CF00FC4518DAF76A189602E1',
    interfaces: [
      {
        uuid: 'com_interface::28a6b060-055c-4d20-a715-9bafd9edb90d',
        properties: {
          interface_type: 'websocket-client',
          channel: 'websocket',
          name: 'ws://localhost:8043',
          direction: 'InOut',
          round_trip_time: 40,
          max_bandwidth: 1000,
        },
        sockets: [
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c61f',
            direction: 'InOut',
            endpoint: '@server',
            properties: { known_since: 4, distance: 1, is_direct: true, channel_factor: 1, direction: 'InOut' },
          },
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c61f',
            direction: 'InOut',
            endpoint: '@@8FAEBB621D91CB42EA59389EB5C47A9BADEF',
            properties: { known_since: 16852, distance: 2, is_direct: false, channel_factor: 1, direction: 'InOut' },
          },
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c61f',
            direction: 'InOut',
            endpoint: '@example1',
            properties: { known_since: 16852, distance: 2, is_direct: false, channel_factor: 1, direction: 'InOut' },
          },
        ],
        is_waiting_for_socket_connections: false,
      },
      {
        uuid: 'com_interface::12364567-055c-4d20-a715-9bafd9edb90d',
        properties: {
          interface_type: 'tcp-client',
          channel: 'tcp',
          name: '12.34.56.78:8043',
          direction: 'InOut',
          round_trip_time: 40,
          max_bandwidth: 1000,
        },
        sockets: [
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c62a',
            direction: 'InOut',
            endpoint: '@example1',
            properties: { known_since: 16852, distance: 2, is_direct: false, channel_factor: 1, direction: 'InOut' },
          },
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c62b',
            direction: 'InOut',
            endpoint: '@example2',
            properties: { known_since: 16852, distance: 2, is_direct: false, channel_factor: 1, direction: 'InOut' },
          },
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c62c',
            direction: 'InOut',
            endpoint: '@server',
            properties: { known_since: 4, distance: 1, is_direct: true, channel_factor: 1, direction: 'InOut' },
          },
          {
            uuid: 'socket::4a17ec53-6027-4527-9786-abf8db76c62d',
            direction: 'InOut',
            endpoint: '@@8FAEBB621D91CB42EA59389EB5C47A9BADEF',
            properties: { known_since: 16852, distance: 2, is_direct: false, channel_factor: 1, direction: 'InOut' },
          },
        ],
        is_waiting_for_socket_connections: false,
      },
      {
        uuid: 'com_interface::a8fc3085-9717-4715-bbed-b20f6128e6df',
        properties: {
          interface_type: 'local',
          channel: 'local',
          direction: 'InOut',
          round_trip_time: 0,
          max_bandwidth: 4294967295,
        },
        sockets: [
          {
            uuid: 'socket::cb2f1a7e-5fc6-4bd1-acdc-ce796606c6bd',
            direction: 'InOut',
            endpoint: '@@local',
            properties: { known_since: 0, distance: 0, is_direct: true, channel_factor: 1, direction: 'InOut' },
          },
        ],
        is_waiting_for_socket_connections: false,
      },
    ] as ComHubInterface[],
  })

  // ---- State ----

  const searchQuery = ref('')
  const expanded = reactive<Record<string, boolean>>({})

  // ---- Data transformation: interface[] → endpoint → sockets+interface ----

  const endpointMap = computed((): Map<string, SocketWithInterface[]> => {
    const map = new Map<string, SocketWithInterface[]>()

    for (const iface of comhub.interfaces) {
      for (const socket of iface.sockets) {
        const entry: SocketWithInterface = {
          ...socket,
          interface: {
            uuid: iface.uuid,
            properties: iface.properties,
          },
        }
        if (!map.has(socket.endpoint)) {
          map.set(socket.endpoint, [])
        }
        map.get(socket.endpoint)!.push(entry)
      }
    }

    return map
  })

  // ---- Filtered endpoints based on search ----

  const filteredEndpoints = computed((): [string, SocketWithInterface[]][] => {
  const query = searchQuery.value.trim().toLowerCase()
  const entries = Array.from(endpointMap.value.entries())
  if (!query) return entries
  return entries.filter(([endpointId]) =>
    endpointId.toLowerCase().includes(query)
  )
})

watch(filteredEndpoints, (entries) => {
  const query = searchQuery.value.trim()
  if (!query) return
  for (const [endpointId] of entries) {
    expanded[endpointId] = true
  }
})

  // ---- Helpers ----

  function toggle(endpointId: string) {
    expanded[endpointId] = !expanded[endpointId]
  }

  /**
   * Direction logic per spec:
   * - "↔" if any socket is InOut, or if both In and Out exist
   * - "←" if only In sockets
   * - "→" if only Out sockets
   */
  function getEndpointDirection(sockets: SocketWithInterface[]): string {
    const dirs = new Set(sockets.map((s) => s.direction))
    if (dirs.has('InOut')) return '↔'
    if (dirs.has('In') && dirs.has('Out')) return '↔'
    if (dirs.has('In')) return '←'
    if (dirs.has('Out')) return '→'
    return '↔'
  }

  /**
   * Direct badge: shown if ANY socket for this endpoint is direct
   */
  function isDirect(sockets: SocketWithInterface[]): boolean {
    return sockets.some((s) => s.properties.is_direct)
  }

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  function formatTime(seconds: number): string {
    if (seconds < 60) return rtf.format(-seconds, 'second')
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return rtf.format(-minutes, 'minute')
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return rtf.format(-hours, 'hour')
    return rtf.format(-Math.floor(hours / 24), 'day')
  }
  </script>