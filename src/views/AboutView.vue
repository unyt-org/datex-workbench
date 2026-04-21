<script setup lang="ts">
import { Datex } from '@/lib/runtime'
</script>

<template>
  <div class="p-6 font-mono text-sm text-foreground">
    <h1 class="text-lg font-semibold mb-4">About</h1>

    <div class="mb-2">DATEX Version: {{ Datex.version }}</div>
    <div class="mb-2">JS Version: {{ Datex.js_version }}</div>
    <div class="mb-4">Endpoint: {{ Datex.endpoint }}</div>

    <h2 class="text-md font-semibold mb-2">Active Features</h2>
    <div class="text-muted-foreground italic">No features enabled</div>
  </div>
</template>