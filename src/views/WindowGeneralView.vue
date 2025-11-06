<template>
  <div class="w-full h-full bg-primary-foreground text-primary p-1">
    <Window :node="useLayoutTree().layoutTree" />
  </div>
</template>

<script setup lang="ts">
import Window from '@/components/Window.vue'
import { useLayoutTree } from '@/composable/useLayoutTree.ts'
</script>

<style scoped></style>
