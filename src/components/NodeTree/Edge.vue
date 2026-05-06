<script setup lang="ts">
import type { Edge, EdgeStyle } from '@/types/NodeTree/node-tree';
import { computed } from 'vue';

const props = defineProps<{
    edge?: Edge;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}>();

function getPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style: EdgeStyle = 'bezier',
): string {
    if (style === 'straight') {
        return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    if (style === 'step') {
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }
    // bezier (default)
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

function getEdgeColor(edgetype: string): string {
    const colors: Record<string, string> = {
        websocket: '#3b82f6', // blue
        'websocket-client': '#3b82f6',
        'websocket-server': '#3b82f6',
        http: '#22c55e', // green
        tcp: '#a855f7', // purple
        webpush: '#f97316', // orange
        local: '#6b7280', // gray
        tempType: '#3b82f6',
    };
    return colors[edgetype] ?? '#9ca3af';
}
const midX = computed(() => (props.x1 + props.x2) / 2);
const midY = computed(() => (props.y1 + props.y2) / 2);
</script>

<template>
    <g>
        <path
            :d="getPath(props.x1, props.y1, props.x2, props.y2, props.edge?.style)"
            fill="none"
            :stroke="getEdgeColor(props.edge?.edgetype ?? '')"
            stroke-width="2"
            opacity="0.8"
        />
        <!-- Arrow for unidirectional -->
        <polygon
            v-if="props.edge?.direction === 'unidirectional'"
            :points="`${props.x2},${props.y2} ${props.x2 - 8},${props.y2 - 4} ${props.x2 - 8},${props.y2 + 4}`"
            :fill="getEdgeColor(props.edge?.edgetype ?? '')"
        />
        <!-- Interface type label in middle of edge -->
        <g v-if="props.edge?.edgetype">
            <rect
                :x="midX - 40"
                :y="midY - 10"
                width="80"
                height="20"
                rx="4"
                fill="white"
                class="dark:fill-neutral-900"
                opacity="0.9"
            />
            <text
                :x="midX"
                :y="midY + 4"
                text-anchor="middle"
                font-size="10"
                :fill="getEdgeColor(props.edge?.edgetype ?? '')"
                class="select-none"
            >
                {{ props.edge.edgetype }}
            </text>
        </g>
    </g>
</template>
