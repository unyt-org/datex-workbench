<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Node } from '@/types/NodeTree/node-tree';

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
            <!-- <CardAction>Card Action</CardAction> -->
        </CardHeader>
        <CardContent>
            <Table>
                <TableBody>
                    <TableRow v-for="(field, index) in node.fields" :key="index">
                        <TableCell class="w-1/2">id: {{ field.id }}</TableCell>
                        <TableCell class="w-1/2">und so</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>
</template>
