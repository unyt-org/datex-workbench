<script setup lang="ts">
import { getInstructionColor } from '@/lib/instruction-types';
defineProps<{
    name: string;
    meta: string | null;
}>();
</script>

<template>
    <span class="font-mono flex ml-1" :class="{ italic: name.startsWith('TYPE.') }">
        <span :style="{ color: getInstructionColor(name, true) }">{{ name }}</span>
        <span v-if="meta" class="ml-1.5 whitespace-break-spaces">
            {{ meta }}
        </span>
    </span>
</template>
