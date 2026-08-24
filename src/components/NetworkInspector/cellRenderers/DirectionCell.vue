<script setup lang="ts">
import { MoveLeft, MoveRight } from 'lucide-vue-next';

const props = defineProps<{
    value: string;
}>();
</script>

<template>
    <div class="flex items-center">
        <MoveLeft v-if="props.value === 'in'" class="h-4 w-4" />
        <MoveRight v-else class="h-4 w-4" />
    </div>
</template>
