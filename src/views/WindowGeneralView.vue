<template>
    <div class="bg-primary-foreground text-primary h-full w-full p-1">
        <Window :node="useLayoutTree().layoutTree" />
    </div>
</template>

<script setup lang="ts">
import Window from '@/components/Window.vue';
import { useLayoutTree } from '@/composable/useLayoutTree.ts';
</script>

<style scoped></style>
