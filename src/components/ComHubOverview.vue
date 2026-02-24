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
            <div class="font-medium">
              {{ iface.properties.name || iface.properties.interface_type }}
            </div>
  
            <div class="text-xs text-neutral-500 mt-1">
              Type: {{ iface.properties.interface_type }}
              • Sockets: {{ iface.sockets.length }}
            </div>
          </div>
  
          <div class="text-xs text-neutral-400">
            RTT: {{ iface.properties.round_trip_time }} ms
          </div>
        </div>
  
        <!-- Expanded Socket List -->
        <div v-if="expanded[iface.uuid]" class="mt-3 border-t pt-3">
          <div
            v-for="socket in iface.sockets"
            :key="socket.uuid + socket.endpoint"
            class="text-sm p-2 rounded bg-neutral-100 dark:bg-neutral-800 mb-2"
          >
            <div><strong>Endpoint:</strong> {{ socket.endpoint }}</div>
            <div>
              <strong>Direct:</strong>
              {{ socket.properties.is_direct ? "Direct" : "Indirect" }}
            </div>
            <div>
              <strong>Distance:</strong> {{ socket.properties.distance }}
            </div>
            <div>
              <strong>Time since creation:</strong>
              {{ formatTime(socket.properties.known_since) }}
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
   * Replace later with real ComHub runtime state
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
  
  function toggle(uuid: string) {
    expanded[uuid] = !expanded[uuid]
  }
  
  function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }
  </script>
  