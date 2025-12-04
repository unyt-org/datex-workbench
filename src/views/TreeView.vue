<script setup lang="ts">
import NetworkNode from '@/components/NetworkTree/NetworkNode.vue';

function mouseDown(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    console.log(`Move ${card.id}`);
}

function mouseUp(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    console.log(`Stop moving ${card.id}`);
}
</script>

<template>
    <div class="bg-primary-foreground text-primary h-full w-full p-1">
        <NetworkNode
            @mousedown.left="mouseDown"
            @mouseup.left="mouseUp"
            id="node1"
            class="absolute"
            style="top: 50px; left: 50px"
        ></NetworkNode>
        <NetworkNode
            @mousedown.left="mouseDown"
            @mouseup.left="mouseUp"
            id="node2"
            class="absolute"
            style="top: 300px; left: 300px"
        ></NetworkNode>
    </div>
</template>
