<script setup lang="ts">
import { Datex } from '@/lib/runtime'

const features = ['Network Inspector', 'Block Viewer', 'Node View']
</script>

<template>
  <div class="flex h-full w-full items-center justify-center p-6">
    <div class="w-full max-w-xl rounded-xl bg-muted/30 p-8 text-sm">
      <h1 class="text-lg font-semibold mb-4 text-foreground">About</h1>

      <div class="mb-2">
        <span class="text-foreground">DATEX Version: </span>
        <span class="text-muted-foreground">{{ Datex.version }}</span>
      </div>
      <div class="mb-2">
        <span class="text-foreground">JS Version: </span>
        <span class="text-muted-foreground">{{ Datex.js_version }}</span>
      </div>
      <div class="mb-4">
        <span class="text-foreground">Endpoint: </span>
        <span class="text-muted-foreground">{{ Datex.endpoint }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-foreground font-semibold">Active Features:</span>
        <span
          v-for="feature in features"
          :key="feature"
          class="rounded-full border border-border px-2 py-0.5 text-xs text-foreground"
        >
          {{ feature }}
        </span>
      </div>
    </div>
  </div>
</template>