<template>
  <div class="m-5 p-4 h-full overflow-auto">
    <h2 class="text-lg font-semibold mb-4">ComHub Overview</h2>

    <div
      v-for="iface in comhub.interfaces"
      :key="iface.uuid"
      class="border rounded-lg p-3 mb-3 bg-white dark:bg-neutral-900 shadow-sm"
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
      <div v-if="expanded[iface.uuid]" class="mt-3 border-t py-2">
        <div class="flex flex-col gap-2">
        <div
          v-for="socket in getSortedSockets(iface.sockets)"
          :key="socket.uuid + socket.endpoint"
          class="text-sm p-3 rounded bg-neutral-100 dark:bg-neutral-800"
        >
          <!-- 5. Endpoint highlighted as heading + 7. direct label + 3. arrow -->
          <h4 class="font-semibold flex items-center gap-2">
            {{ socket.endpoint }}

            <!-- Direct label only if direct -->
            <span
              v-if="socket.properties.is_direct"
              class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              direct
            </span>

            <!-- Direction arrow -->
            <span class="text-neutral-400">
              {{ getDirectionArrow(socket.direction) }}
            </span>
          </h4>

          <!-- 6. Distance + time in one line with bullet -->
          <div class="text-xs text-neutral-500 mt-1 space-y-0.5">
             <div>Distance: {{ socket.properties.distance }}</div>
            <div>Created: {{ formatTime(socket.properties.known_since) }}
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    <div v-if="!comhub.interfaces.length" class="text-sm text-neutral-500">
      No active interfaces found.
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

/**
 * TEMP MOCK DATA (from issue JSON)
 * TODO: Replace mock JSON with live ComHub runtime state
 */
const comhub = reactive({
  endpoint: "@@FB2D5CF3FBE8CF00FC4518DAF76A189602E1",
  interfaces: [
    {
      uuid: "com_interface::28a6b060-055c-4d20-a715-9bafd9edb90d",
      properties: {
        interface_type: "websocket-client",
        channel: "websocket",
        name: "ws://localhost:8043",
        direction: "InOut",
        round_trip_time: 40,
        max_bandwidth: 1000,
        continuous_connection: false,
        allow_redirects: true,
        is_secure_channel: false,
        reconnection_config: "NoReconnect",
        auto_identify: true
      },
      sockets: [
        {
          uuid: "socket::4a17ec53-6027-4527-9786-abf8db76c61f",
          direction: "InOut",
          endpoint: "@server",
          properties: {
            known_since: 4,
            distance: 1,
            is_direct: true,
            channel_factor: 1,
            direction: "InOut"
          }
        },
        {
          uuid: "socket::4a17ec53-6027-4527-9786-abf8db76c61f",
          direction: "InOut",
          endpoint: "@@8FAEBB621D91CB42EA59389EB5C47A9BADEF",
          properties: {
            known_since: 16852,
            distance: 2,
            is_direct: false,
            channel_factor: 1,
            direction: "InOut"
          }
        }
      ],
      is_waiting_for_socket_connections: false
    }
  ],
  endpoint_sockets: {}
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
</script>