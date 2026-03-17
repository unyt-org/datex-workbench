<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import EndpointDocs from '@/components/endpoint/EndpointDocs.vue'
import EndpointFingerprint from '@/components/endpoint/EndpointFingerprint.vue'
import EndpointPointers from '@/components/endpoint/EndpointPointers.vue'
import EndpointInterfaces from '@/components/endpoint/EndpointInterfaces.vue'
import { Datex } from '@/lib/runtime'

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
  fingerprint?: string
  interfaces?: EndpointInterface[]
  methods?: EndpointMethod[]
  documentation?: string
}

const route = useRoute()

const endpointId = computed(() => route.params.endpoint_id as string)

/**
 * TODO: Replace with real implementation once DATEX runtime is available
 * Will call: await Datex.Runtime.execute("#public") on the endpoint
 */
 async function fetchEndpointInfo(id: string): Promise<Endpoint> {
  // TODO: const result = await Datex.Runtime.execute("#public", id)
  console.warn('[EndpointView] fetchEndpointInfo stub called', { id })
  return {
    id,
    name: `Endpoint ${id}`,
    description: 'Mock endpoint description',
    profile: 'Default profile',
    fingerprint: 'AB:CD:EF:12:34',
    interfaces: [],
    methods: [],
    documentation: '# Endpoint Documentation\n\nPublic interface methods...',
  }
}
const endpoint = ref<Endpoint | null>(null)

onMounted(async () => {
  endpoint.value = await fetchEndpointInfo(endpointId.value)
})

type EndpointTag = 'me' | 'local' | 'anonymous' | 'named'

function getEndpointTag(id: string, currentEndpoint: string): EndpointTag {
  if (id === currentEndpoint) return 'me'
  if (id === '@@local') return 'local'
  if (id.startsWith('@@')) return 'anonymous'
  return 'named'
}

const tagStyles: Record<EndpointTag, string> = {
  me:        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  local:     'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  anonymous: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
  named:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
}

</script>

<template>
  <div class="flex flex-col gap-6 p-5 overflow-y-auto h-full bg-neutral-50 dark:bg-neutral-950">
    <div v-if="endpoint" class="flex flex-col gap-4">
      <!-- Header -->
      <section class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
  <h1 class="text-xl font-semibold font-mono text-neutral-900 dark:text-neutral-100">{{ endpoint.name }}</h1>
  <span
    class="text-xs px-2 py-0.5 rounded"
    :class="tagStyles[getEndpointTag(endpoint.id, String(Datex.endpoint))]"
  >
    {{ getEndpointTag(endpoint.id, String(Datex.endpoint)) }}
  </span>
</div>
        <p v-if="endpoint.description" class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ endpoint.description }}
        </p>
        <p v-if="endpoint.profile" class="text-xs text-neutral-400 dark:text-neutral-500">
          Profile: {{ endpoint.profile }}
        </p>
      </section>

      <!-- Fingerprint -->
      <section class="flex flex-col gap-2 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
            <EndpointFingerprint :fingerprint="endpoint.fingerprint" :endpoint-id="endpoint.id"/>
                </section>

      <section class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
        <EndpointPointers v-if="endpoint" :methods="endpoint.methods ?? []" />
      </section>

      <!-- Interfaces -->
      <section class="flex flex-col gap-2 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
        <h2 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Public Interfaces</h2>
        <EndpointInterfaces :interfaces="endpoint?.interfaces ?? []" />
      </section>

      <!-- Documentation (markdown placeholder) -->
      <section v-if="endpoint.documentation" class="flex flex-col gap-2 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-900">
        <h2 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Documentation</h2>
        <EndpointDocs :markdown="endpoint.documentation" />
      </section>


    </div>
  </div>
</template>