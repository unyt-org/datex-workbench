<script setup lang="ts">

defineProps<{
  name: string
  meta: string | null
}>()

</script>

<template>
  <span class="font-mono">
    <span class="text-teal-300">{{ name }}</span>
    <span
      v-if="meta"
      class="ml-1.5 text-muted-foreground"
    >
      {{ meta }}
    </span>
  </span>
</template>