<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';
import type { ICellRendererParams } from 'ag-grid-community';

interface Props {
    params: ICellRendererParams;
}

const props = defineProps<Props>();
const direction = props.params.value as string;
</script>

<template>
    <div class="flex items-center">
        <ArrowLeft v-if="direction === 'in'" class="h-4 w-4 text-green-500" />
        <ArrowRight v-else class="h-4 w-4 text-blue-500" />
    </div>
</template>
