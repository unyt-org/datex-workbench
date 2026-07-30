<script setup lang="ts">
import instructionTypes from './instructionTypes.json';

defineProps<{
    name: string;
    meta: string | null;
}>();

const typeColors: Record<string, string> = {
    STRUCTURE: 'text-green-400',
    OPERATION: 'text-purple-400',
    VALUE: 'text-blue-400',
    SHARED: 'text-purple-400',
};

function getColor(name: string): string {
    const type = (instructionTypes as Record<string, string>)[name];
    return type ? (typeColors[type] ?? 'text-gray-300') : 'text-gray-300';
}
</script>

<template>
    <span class="font-mono">
        <span :class="getColor(name)">{{ name }}</span>
        <span v-if="meta" class="ml-1.5 text-muted-foreground">
            {{ meta }}
        </span>
    </span>
</template>
