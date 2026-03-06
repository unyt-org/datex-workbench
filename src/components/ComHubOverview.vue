<template>
  <div class="h-full overflow-auto">


  <div class="flex items-center justify-between mb-3">
  <h2 class="text-lg font-semibold">ComHub Overview</h2>
  <span class="text-xs font-mono px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">
    {{ comhub.endpoint }}
  </span>
</div>


<!-- Search Bar -->
<div class="mb-4 w-1/2">
  <input
    v-model="searchQuery"
    type="text"
    placeholder="Search endpoint identifier (e.g. @@...)"
    class="w-full px-3 py-2 text-sm rounded border bg-white dark:bg-neutral-900 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<!-- Advanced Mode Toggle -->
<div class="mb-4 flex items-center gap-2">
  <label class="text-sm text-neutral-500 cursor-pointer select-none flex items-center gap-2">
    <input type="checkbox" v-model="advancedMode" class="accent-blue-500" />
    Advanced Mode
  </label>
</div>

    <div
      v-for="iface in filteredInterfaces"
      :key="iface.uuid"
      class="border rounded-lg p-3 mb-3 bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-neutral-100"
    >
      <!-- Interface Header -->
      <div
        class="flex justify-between items-center cursor-pointer"
        @click="toggle(iface.uuid)"
      >
        <div>
          <!-- 1. Channel type prominent + name -->
          <h3 class="font-semibold">
            {{ iface.properties.interface_type }}
            <span v-if="iface.properties.name">
              ({{ iface.properties.name }})
            </span>
          </h3>

          <!-- 2. Show channel next to socket count -->
          <div class="text-xs text-neutral-500 mt-1">
            Sockets: {{ iface.sockets.length }}
            • Channel: {{ iface.properties.channel }}
          </div>
        </div>

        <div class="text-xs text-neutral-400">
          RTT: {{ iface.properties.round_trip_time }} ms
        </div>
      </div>

     <!-- Expanded Socket List -->
<div v-if="expanded[iface.uuid]" class="mt-3 border-t pt-3 flex flex-col gap-3">
  <div
    v-for="socket in getSortedSockets(iface.sockets)"
    :key="socket.uuid + socket.endpoint"
    class="text-sm p-3 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-col gap-1 flex-1">
        <h4 class="font-semibold flex items-center gap-2">
          <span class="font-mono text-blue-600 dark:text-blue-400">{{ socket.endpoint }}</span>
          <span
            v-if="socket.properties.is_direct"
            class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          >
            direct
          </span>
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
  <div
  v-if="filteredInterfaces.length === 0"
  class="text-sm text-neutral-500"
>
  No matching endpoints found.
</div>
</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'

const searchQuery = ref('')

const advancedMode = ref(false) // 

/**
 * TEMP MOCK DATA (from issue JSON)
 * TODO: Replace mock JSON with live ComHub runtime state
 */
const comhub = reactive({
    "endpoint": "@@FB2D5CF3FBE8CF00FC4518DAF76A189602E1",
    "interfaces": [
        {
            "uuid": "com_interface::28a6b060-055c-4d20-a715-9bafd9edb90d",
            "properties": {
                "interface_type": "websocket-client",
                "channel": "websocket",
                "name": "ws://localhost:8043",
                "direction": "InOut",
                "round_trip_time": 40,
                "max_bandwidth": 1000,
                "continuous_connection": false,
                "allow_redirects": true,
                "is_secure_channel": false,
                "reconnection_config": "NoReconnect",
                "auto_identify": true
            },
            "sockets": [
                {
                    "uuid": "socket::4a17ec53-6027-4527-9786-abf8db76c61f",
                    "direction": "InOut",
                    "endpoint": "@server",
                    "properties": {
                        "known_since": 4,
                        "distance": 1,
                        "is_direct": true,
                        "channel_factor": 1,
                        "direction": "InOut"
                    }
                },
                {
                    "uuid": "socket::4a17ec53-6027-4527-9786-abf8db76c61f",
                    "direction": "InOut",
                    "endpoint": "@@8FAEBB621D91CB42EA59389EB5C47A9BADEF",
                    "properties": {
                        "known_since": 16852,
                        "distance": 2,
                        "is_direct": false,
                        "channel_factor": 1,
                        "direction": "InOut"
                    }
                }
            ],
            "is_waiting_for_socket_connections": false
        },
        {
            "uuid": "com_interface::a8fc3085-9717-4715-bbed-b20f6128e6df",
            "properties": {
                "interface_type": "local",
                "channel": "local",
                "direction": "InOut",
                "round_trip_time": 0,
                "max_bandwidth": 4294967295,
                "continuous_connection": false,
                "allow_redirects": true,
                "is_secure_channel": false,
                "reconnection_config": "NoReconnect",
                "auto_identify": false
            },
            "sockets": [
                {
                    "uuid": "socket::cb2f1a7e-5fc6-4bd1-acdc-ce796606c6bd",
                    "direction": "InOut",
                    "endpoint": "@@local",
                    "properties": {
                        "known_since": 0,
                        "distance": 0,
                        "is_direct": true,
                        "channel_factor": 1,
                        "direction": "InOut"
                    }
                }
            ],
            "is_waiting_for_socket_connections": false
        }
    ],
    "endpoint_sockets": {}
})

const expanded = reactive<Record<string, boolean>>({})

type ComHubSocket = {
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

const filteredInterfaces = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  // If no search, return all interfaces unchanged
  if (!query) return comhub.interfaces

  return comhub.interfaces
    .map((iface) => {
      const matchingSockets = iface.sockets.filter((socket) =>
        socket.endpoint.toLowerCase().includes(query)
      )

      // If no matching sockets, this interface should be hidden
      if (matchingSockets.length === 0) return null
      expanded[iface.uuid] = true

      // Return a shallow copy with ONLY matching sockets
      return {
        ...iface,
        sockets: matchingSockets,
      }
    })
    .filter((iface): iface is typeof comhub.interfaces[number] => iface !== null)
})

watch(searchQuery, (val) => {
  if (!val.trim()) {
    Object.keys(expanded).forEach((key) => {
      expanded[key] = false
    })
  }
})

function toggle(uuid: string) {
  expanded[uuid] = !expanded[uuid]
}

/**
 * 4. Sorting logic:
 * - Direct sockets first
 * - Then newest first (lower known_since = newer)
 */
function getSortedSockets(sockets: ComHubSocket[]) {
  return [...sockets].sort((a, b) => {
    if (a.properties.is_direct !== b.properties.is_direct) {
      return a.properties.is_direct ? -1 : 1
    }
    return a.properties.known_since - b.properties.known_since
  })
}

/**
 * 3. Direction arrows
 */
function getDirectionArrow(direction: string): string {
  if (direction === "InOut") return "↔"
  if (direction === "In") return "←"
  if (direction === "Out") return "→"
  return ""
}

const rtf = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
})

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return rtf.format(-seconds, "second")
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return rtf.format(-minutes, "minute")
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return rtf.format(-hours, "hour")
  }

  const days = Math.floor(hours / 24)
  return rtf.format(-days, "day")
}

/**
 * TODO: Implement once new DATEX release is available
 * Disconnects a socket from its interface
 */
 function disconnectSocket(interfaceUuid: string, socketUuid: string, endpoint: string) {
  console.warn(`[ComHub] disconnectSocket stub called`, { interfaceUuid, socketUuid, endpoint })
}

</script>