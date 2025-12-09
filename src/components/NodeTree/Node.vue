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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
    name?: string;
}>();
</script>

<template>
    <Card class="w-xs">
        <CardHeader>
            <CardTitle>{{ props.name }}</CardTitle>
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
