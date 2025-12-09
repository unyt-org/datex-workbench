<script setup lang="ts">
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Node } from '@/types/node-tree';

const props = defineProps<{
    node: Node;
}>();
</script>

<template>
    <Card
        class="absolute w-xs"
        :style="{
            left: `${node.position.x}px`,
            top: `${node.position.y}px`,
        }"
    >
        <CardHeader>
            <CardTitle>{{ props.node.name }}</CardTitle>
            <CardDescription>id {{ props.node.id }}</CardDescription>
            <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
            <p>some more data</p>
        </CardContent>
        <CardFooter>
            <p>Card Footer</p>
        </CardFooter>
    </Card>
</template>
