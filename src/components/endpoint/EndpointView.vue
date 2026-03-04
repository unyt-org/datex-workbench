<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EndpointDocs from '@/components/endpoint/EndpointDocs.vue'
import EndpointFingerprint from '@/components/endpoint/EndpointFingerprint.vue'
import EndpointPointers from '@/components/endpoint/EndpointPointers.vue'
import EndpointInterfaces from '@/components/endpoint/EndpointInterfaces.vue'

interface InterfaceProperties {
  name?: string
  interface_type?: string
  channel?: string
  direction?: string
  round_trip_time?: number
  max_bandwidth?: number
  [key: string]: unknown
}

interface EndpointInterface {
  uuid: string
  properties?: InterfaceProperties
  sockets?: unknown[]
  is_waiting_for_socket_connections?: boolean
}

interface EndpointMethod {
  name: string
  description?: string
  pointer?: string
}

interface Endpoint {
  id: string
  name: string
  description?: string
  profile?: string
  fingerprint?: string | Record<string, unknown>
  interfaces?: EndpointInterface[]
  methods?: EndpointMethod[]
  documentation?: string
}

const route = useRoute()

const endpointId = computed(() => route.params.endpoint_id as string)

// TODO: Replace with runtime.ts or store later
const endpoint = computed<Endpoint | null>(() => {
  // temporary mock (structured for easy replacement)
  return {
    id: endpointId.value,
    name: `Endpoint ${endpointId.value}`,
    description: 'Mock endpoint description',
    profile: 'Default profile',
    fingerprint: 'AB:CD:EF:12:34',
    interfaces: [],
    methods: [],
    documentation: '# Endpoint Documentation\n\nPublic interface methods...'
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 overflow-y-auto h-full">
    <div v-if="endpoint" class="flex flex-col gap-4">
      <!-- Header -->
      <section class="flex flex-col gap-1">
        <h1 class="text-xl font-semibold">
          {{ endpoint.name }}
        </h1>
        <p v-if="endpoint.description" class="text-sm text-neutral-500">
          {{ endpoint.description }}
        </p>
        <p v-if="endpoint.profile" class="text-xs text-neutral-400">
          Profile: {{ endpoint.profile }}
        </p>
      </section>

      <!-- Fingerprint -->
      <section class="flex flex-col gap-2">
            <EndpointFingerprint :fingerprint="endpoint.fingerprint" />
                </section>

      <section>
        <EndpointPointers v-if="endpoint" :methods="endpoint.methods ?? []" />
      </section>

      <!-- Interfaces -->
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium">Public Interfaces</h2>
        <EndpointInterfaces :interfaces="endpoint?.interfaces ?? []" />
      </section>

      <!-- Documentation (markdown placeholder) -->
      <section v-if="endpoint.documentation" class="flex flex-col gap-2">
        <h2 class="text-sm font-medium">Documentation</h2>
        <EndpointDocs :markdown="endpoint.documentation" />
      </section>

      
    </div>
  </div>
</template>