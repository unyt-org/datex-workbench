<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{
  value: string
}>()
</script>

<template>
    <div class="flex items-center">
        <ArrowLeft v-if="props.value === 'in'" class="h-4 w-4 text-green-500" />
        <ArrowRight v-else class="h-4 w-4 text-blue-500" />
    </div>
</template>
