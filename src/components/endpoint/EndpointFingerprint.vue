<script setup lang="ts">
import { computed } from 'vue'

type Fingerprint = string | Record<string, unknown> | undefined

interface Props {
  fingerprint?: Fingerprint
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
  a.download = 'endpoint-fingerprint.json'
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <h2 class="text-sm font-medium">
      Fingerprint
    </h2>

    <div class="flex items-start justify-between gap-3 rounded bg-neutral-100 dark:bg-neutral-800 p-3">
      <pre class="text-xs break-all whitespace-pre-wrap">
{{ fingerprintText }}
      </pre>

      <button
        class="shrink-0 text-xs px-3 py-1.5 rounded border hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        :disabled="!props.fingerprint"
        @click="downloadFingerprint"
      >
        Download
      </button>
    </div>
  </section>
</template>