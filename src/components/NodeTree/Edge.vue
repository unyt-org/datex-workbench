<script setup lang="ts">
import type { Edge } from '@/types/NodeTree/node-tree';

const props = defineProps<{
    edge?: Edge;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}>();
</script>

<template>
    <svg class="w-full h-full">
        <line
            :x1="props.x1"
            :y1="props.y1"
            :x2="props.x2"
            :y2="props.y2"
            style="stroke: white; stroke-width: 2"
        />
    </svg>
</template>
