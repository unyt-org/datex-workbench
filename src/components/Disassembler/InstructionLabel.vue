<script setup lang="ts">
import { computed } from 'vue'
import { isMetaAnnotation } from '@/types/disassembler'

const props = defineProps<{
  name: string
  meta: string | null
}>()

const isValue = computed(() => props.meta !== null && !isMetaAnnotation(props.meta))
</script>

<template>
  <span class="font-mono">
    <span class="text-teal-300">{{ name }}</span>
    <span
      v-if="meta"
      class="ml-1.5"
      :class="isValue ? 'text-gray-200' : 'text-gray-500'"
    >
      {{ meta }}
    </span>
  </span>
</template>