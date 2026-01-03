<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { tokenizeSearchQuery, tokensToStyledHtml } from '@/utils/searchParser';

interface NetworkFilterProps {
    filterValue: string;
    placeholder?: string;
    debounce?: number;
}

const props = withDefaults(defineProps<NetworkFilterProps>(), {
    placeholder: 'Search: type:value sender:value receiver:value interface:value',
    debounce: 300
});

const emit = defineEmits<{
    'update:filterValue': [value: string];
}>();

// Local ref for immediate UI updates (keeps typing responsive)
const localFilterValue = ref(props.filterValue);

// Watch for external prop changes (e.g., when parent resets the filter)
watch(() => props.filterValue, (newValue) => {
    if (newValue !== localFilterValue.value) {
        localFilterValue.value = newValue;
    }
});

// Debounced watcher that emits to parent only after user stops typing
watchDebounced(
    localFilterValue,
    (newValue) => {
        emit('update:filterValue', newValue);
    },
    { debounce: props.debounce }
);

// Compute styled HTML for syntax highlighting based on local value
const styledText = computed(() => {
    if (!localFilterValue.value) return '';
    const tokens = tokenizeSearchQuery(localFilterValue.value);
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
