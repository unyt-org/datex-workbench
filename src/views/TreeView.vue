<script setup lang="ts">
import NetworkNode from '@/components/NodeTree/Node.vue';
import { ref, type Ref } from 'vue';
import type { NodeTree, Position } from '@/types/NodeTree/node-tree';
import type { NodeTreeInput } from '@/types/NodeTree/node-tree-input';
import { parseNodeTree } from '@/composable/NodeTree/parseNodeTree';
import exampleJson from '@/../test/composable/NodeTree/fixtures/validExampleShort.json';

const isDragging = ref(false);
const currentNodeId = ref<string | null>(null);
const startPos = ref<Position>({ x: 0, y: 0 });
const nodePositions = ref<Record<string, Position>>({
    node1: { x: 50, y: 50 },
    node2: { x: 300, y: 300 },
    node3: { x: 100, y: 500 },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mouseDown(event: MouseEvent, nodeId: string) {
    isDragging.value = true;
    currentNodeId.value = nodeId;
    if (!nodePositions.value[nodeId]) {
        console.error(`Node with id ${nodeId} not found!`);
        return;
    }
    startPos.value = {
        x: event.clientX - nodePositions.value[nodeId].x,
        y: event.clientY - nodePositions.value[nodeId].y,
    };
    event.preventDefault(); // Prevent text selection
}

function mouseMove(event: MouseEvent) {
    if (!isDragging.value || !currentNodeId.value) return;

    const nodeId = currentNodeId.value;
    nodePositions.value[nodeId] = {
        x: event.clientX - startPos.value.x,
        y: event.clientY - startPos.value.y,
    };
}

function mouseUp() {
    isDragging.value = false;
    currentNodeId.value = null;
}

console.log(exampleJson);
const example = exampleJson as NodeTreeInput;
const tree: Ref<NodeTree> = ref(parseNodeTree(example));
console.log(tree.value);
</script>

<template>
    <div
        class="bg-primary-foreground relative h-full w-full p-1"
        @mousemove="mouseMove"
        @mouseup="mouseUp"
        @mouseleave="mouseUp"
    >
        <!-- <NetworkNode
            @mousedown.left="(e: MouseEvent) => mouseDown(e, 'node1')"
            :style="{
                position: 'absolute',
                left: `${nodePositions.node1?.x}px`,
                top: `${nodePositions.node1?.y}px`,
                zIndex: currentNodeId === 'node1' ? 10 : 1,
            }"
        /> -->
        <NetworkNode v-for="(node, index) in tree.nodes" :key="index" :node="node" />
    </div>
</template>
