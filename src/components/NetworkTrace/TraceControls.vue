<script setup lang="ts">
import { ref } from 'vue'
import { Datex } from '@/lib/runtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { traceToNodeTree } from '@/composable/NetworkTrace/traceToNodeTree'
import type { NodeTree } from '@/types/NodeTree/node-tree.ts'

const props = defineProps<{
  currentTree: NodeTree | null
}>()

const emit = defineEmits<{
  'trace-result': [tree: NodeTree]
}>()

const endpoint = ref('@example')
const timeout = ref(5000)
const isLoading = ref(false)

async function sendTrace() {
  isLoading.value = true
  try {
    const result = await Datex.comHub.getTrace(endpoint.value)
    const tree = traceToNodeTree(result, props.currentTree ?? undefined)
    emit('trace-result', tree)
   } catch (err) {
    console.error('trace error:', err)
  } finally {
    isLoading.value = false
  }
}

async function autoTrace() {
  isLoading.value = true
  try {
    const metadata = await Datex.comHub.getMetadata()

    // Extract unique endpoints from all interface sockets
    const endpoints = new Set<string>()
    for (const iface of metadata.interfaces ?? []) {
      for (const socket of iface.sockets ?? []) {
        if (socket.endpoint && socket.endpoint !== '@@local') {
          endpoints.add(socket.endpoint)
        }
      }
    }

    console.log('endpoints to trace:', [...endpoints])

    let currentTree = props.currentTree ?? undefined
    for (const ep of endpoints) {
      try {
        const result = await Datex.comHub.getTrace(ep)
        currentTree = traceToNodeTree(result, currentTree)
      } catch (err) {
        console.warn(`trace failed for ${ep}:`, err)
      }
    }
    if (currentTree) emit('trace-result', currentTree)
  } catch (err) {
    console.error('auto-trace error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2 p-4 border-b border-border">
    <Input
      v-model="endpoint"
      placeholder="@endpoint"
      class="w-48"
    />
    <Input
  v-model.number="timeout"
  type="number"
  placeholder="Timeout (ms)"
  class="w-32 opacity-50 cursor-not-allowed"
  disabled
  title="Timeout not yet supported by the DATEX runtime"
/>
    <Button @click="sendTrace" :disabled="isLoading">
      {{ isLoading ? 'Tracing...' : 'Trace' }}
    </Button>
    <Button @click="autoTrace" variant="outline" :disabled="isLoading">
      Auto Trace
    </Button>
  </div>
</template>