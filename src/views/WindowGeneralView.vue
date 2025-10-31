<template>
  <div class="w-full h-full bg-primary-foreground text-primary">
    <Window :node="layoutTree" />
  </div>
</template>

<script setup lang="ts">
import Window from '@/components/Window.vue'
import { reactive } from 'vue'

const layoutTree = reactive({
  type: 'panel',
  id: 'root',
})
</script>

<style scoped></style>
