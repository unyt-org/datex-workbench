<script setup lang="ts">
import NetworkNode from '@/components/NodeTree/Node.vue';
import { ref, type Ref } from 'vue';
import type { NodeTree, Position } from '@/types/NodeTree/node-tree';
import type { NodeTreeInput } from '@/types/NodeTree/node-tree-input';
import { parseNodeTree } from '@/composable/NodeTree/parseNodeTree';
import exampleJson from '@/../test/composable/NodeTree/fixtures/validExampleShort.json';

const example = exampleJson as NodeTreeInput;
const tree: Ref<NodeTree<unknown, unknown>> = ref(parseNodeTree(example));

console.log(tree.value);

const isDragging = ref(false);
const currentNodeId = ref<string | null>(null);
const startPos = ref<Position>({ x: 0, y: 0 });

function mouseDown(event: MouseEvent, nodeId: string) {
    isDragging.value = true;
    currentNodeId.value = nodeId;
    const node = tree.value.nodes.find((node) => node.id === nodeId);
    if (node === undefined) throw new Error('id didnt find node');
    startPos.value = {
        x: event.clientX - node.position.x,
        y: event.clientY - node.position.y,
    };
    event.preventDefault(); // Prevent text selection
}

function mouseMove(event: MouseEvent) {
    if (!isDragging.value || !currentNodeId.value) return;
    const nodeId = currentNodeId.value;
    const node = tree.value.nodes.find((node) => node.id === nodeId);
    if (node) {
        node.position = {
            x: event.clientX - startPos.value.x, // Use startPos.x (offset)
            y: event.clientY - startPos.value.y, // Use startPos.y (offset)
        };
    }
}

function mouseUp() {
    isDragging.value = false;
    currentNodeId.value = null;
}
</script>

<template>
    <div
        class="bg-primary-foreground relative h-full w-full p-1"
        @mousemove="mouseMove"
        @mouseup="mouseUp"
        @mouseleave="mouseUp"
    >
        <svg class="w-full h-full">
            <line x1="360" y1="220" x2="500" y2="300" style="stroke: white; stroke-width: 2" />
        </svg>
        <NetworkNode
            v-for="(node, index) in tree.nodes"
            :key="index"
            :node="node"
            @mousedown.left="(e: MouseEvent) => mouseDown(e, node.id)"
        />
    </div>
</template>
