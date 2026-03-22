<script setup lang="ts">
import type { Column } from '@tanstack/vue-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';

const props = defineProps<{
    column: Column<NetworkBlockTableRow, unknown>;
    label: string;
}>();

function toggleSorting() {
    props.column.toggleSorting(props.column.getIsSorted() === 'asc');
}
</script>

<template>
    <Button
        variant="ghost"
        class="absolute inset-0 h-full w-full justify-start rounded-none px-4"
        @click="toggleSorting"
    >
        {{ label }}
        <ArrowUp v-if="column.getIsSorted() === 'asc'" class="ml-2 h-4 w-4" />
        <ArrowDown v-else-if="column.getIsSorted() === 'desc'" class="ml-2 h-4 w-4" />
        <ArrowUpDown v-else class="ml-2 h-4 w-4" />
    </Button>
</template>
