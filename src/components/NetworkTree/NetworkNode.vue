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

function mouseDown(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    card.classList.add('border-thick');
}

function mouseUp(event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    card.classList.remove('border-thick');
}
</script>

<template>
    <Card
        class="box-border w-xs border-2 border-transparent transition-all duration-100"
        @mousedown.left="mouseDown"
        @mouseup.left="mouseUp"
        @mouseleave="mouseUp"
    >
        <CardHeader>
            <CardTitle>Node</CardTitle>
            <CardDescription>very pretty</CardDescription>
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

<style scoped>
.border-thick {
    border-color: inherit !important;
}
</style>
