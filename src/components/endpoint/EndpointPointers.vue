<script setup lang="ts">
import { computed } from 'vue'
import { getPointers } from '@/lib/runtime'

type PointerMap = Map<string, unknown>

const pointers = computed<PointerMap>(() => {
  return getPointers()
})

const pointerEntries = computed(() => {
  return Array.from(pointers.value.entries())
})

function formatContainer(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-medium">
      Pointer View
    </h2>

    <div
      v-if="pointerEntries.length === 0"
      class="text-sm text-neutral-500 italic"
    >
      No pointers currently loaded in the runtime.
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="[pointerId, container] in pointerEntries"
        :key="pointerId"
        class="rounded bg-neutral-100 dark:bg-neutral-800 p-3"
      >
        <!-- Pointer ID -->
        <div class="font-mono text-xs text-neutral-500 mb-2">
          {{ pointerId }}
        </div>

        <!-- Container Visualization -->
        <pre class="text-xs whitespace-pre-wrap break-all">
{{ formatContainer(container) }}
        </pre>
      </div>
    </div>
  </section>
</template>