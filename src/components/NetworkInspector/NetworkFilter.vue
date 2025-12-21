<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-vue-next';
import { computed } from 'vue';

interface NetworkFilterProps {
    filterValue: string;
    placeholder?: string;
}

const props = withDefaults(defineProps<NetworkFilterProps>(), {
    placeholder: 'Filter by block type...'
});

const emit = defineEmits<{
    'update:filterValue': [value: string];
}>();

const localFilterValue = computed({
    get: () => props.filterValue,
    set: (value: string) => emit('update:filterValue', value)
});

function clearFilter() {
    localFilterValue.value = '';
}
</script>

<template>
    <div class="relative w-full">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
            v-model="localFilterValue"
            :placeholder="placeholder"
            class="pl-9 pr-8"
        />
        <button
            v-if="localFilterValue"
            @click="clearFilter"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
            <X class="h-4 w-4" />
        </button>
    </div>
</template>
