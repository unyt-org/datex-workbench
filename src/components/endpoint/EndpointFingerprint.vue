<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fingerprint?: string
  endpointId?: string
}

const props = defineProps<Props>()

const fingerprintText = computed(() => {
  if (!props.fingerprint) return 'Unavailable'

  if (typeof props.fingerprint === 'string') {
    return props.fingerprint
  }

  // Object case → pretty JSON (future-proof)
  return JSON.stringify(props.fingerprint, null, 2)
})

const downloadFingerprint = () => {
  if (!props.fingerprint) return

  const content =
    typeof props.fingerprint === 'string'
      ? props.fingerprint
      : JSON.stringify(props.fingerprint, null, 2)

  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${props.endpointId ?? 'endpoint'}-public-key.json`
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <h2 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
      Fingerprint
    </h2>

    <div class="flex items-start justify-between gap-3 rounded bg-neutral-100 dark:bg-neutral-800 p-3">
      <pre class="text-xs break-all whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
{{ fingerprintText }}
      </pre>

      <button
        class="shrink-0 text-xs px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        :disabled="!props.fingerprint"
        @click="downloadFingerprint"
      >
        Download
      </button>
    </div>
  </section>
</template>