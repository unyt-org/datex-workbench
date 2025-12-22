<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-vue-next';
import { computed } from 'vue';
import { tokenizeSearchQuery, tokensToStyledHtml } from '@/utils/searchParser';

interface NetworkFilterProps {
    filterValue: string;
    placeholder?: string;
}

const props = withDefaults(defineProps<NetworkFilterProps>(), {
    placeholder: 'Search: type:value sender:value receiver:value interface:value'
});

const emit = defineEmits<{
    'update:filterValue': [value: string];
}>();

const localFilterValue = computed({
    get: () => props.filterValue,
    set: (value: string) => emit('update:filterValue', value)
});

// Compute styled HTML for syntax highlighting
const styledText = computed(() => {
    if (!props.filterValue) return '';
    const tokens = tokenizeSearchQuery(props.filterValue);
    return tokensToStyledHtml(tokens);
});

function clearFilter() {
    localFilterValue.value = '';
}
</script>

<template>
    <div class="relative w-full">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-20" />
        
        <!-- Styled text overlay (behind the input) -->
        <div 
            v-if="localFilterValue"
            class="absolute left-9 right-8 top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap overflow-hidden text-sm z-10"
            v-html="styledText"
        ></div>
        
        <!-- Actual input (text made transparent when there's content) -->
        <Input
            v-model="localFilterValue"
            :placeholder="placeholder"
            :class="[
                'pl-9 pr-8 relative z-10',
                localFilterValue ? 'text-transparent caret-foreground' : ''
            ]"
        />
        
        <button
            v-if="localFilterValue"
            @click="clearFilter"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-20"
        >
            <X class="h-4 w-4" />
        </button>
    </div>
</template>
