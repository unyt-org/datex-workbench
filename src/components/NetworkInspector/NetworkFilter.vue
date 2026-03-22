<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-vue-next';
import { computed, ref, watch, nextTick } from 'vue';
import { watchDebounced, onClickOutside } from '@vueuse/core';
import { tokenizeSearchQuery, tokensToStyledHtml } from '@/utils/searchParser';

export interface SearchSuggestions {
    types: string[];
    senders: string[];
    receivers: string[];
    interfaces: string[];
}

interface NetworkFilterProps {
    filterValue: string;
    placeholder?: string;
    debounce?: number;
    suggestions?: SearchSuggestions;
}

const props = withDefaults(defineProps<NetworkFilterProps>(), {
    placeholder: 'Search: type:value sender:value receiver:value interface:value',
    debounce: 300,
    suggestions: () => ({ types: [], senders: [], receivers: [], interfaces: [] }),
});

const emit = defineEmits<{
    'update:filterValue': [value: string];
}>();

// Local ref for immediate UI updates (keeps typing responsive)
const localFilterValue = ref(props.filterValue);

// Watch for external prop changes (e.g., when parent resets the filter)
watch(
    () => props.filterValue,
    (newValue) => {
        if (newValue !== localFilterValue.value) {
            localFilterValue.value = newValue;
        }
    },
);

// Debounced watcher that emits to parent only after user stops typing
watchDebounced(
    localFilterValue,
    (newValue) => {
        emit('update:filterValue', newValue);
    },
    { debounce: props.debounce },
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

// Suggestions dropdown state
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLDivElement | null>(null);

// Close suggestions when clicking outside
onClickOutside(
    dropdownRef,
    () => {
        showSuggestions.value = false;
    },
    { ignore: [inputRef] },
);

// Compute current suggestions based on input context
const currentSuggestions = computed(() => {
    const value = localFilterValue.value;
    const cursorPos = inputRef.value?.selectionStart ?? value.length;

    // Find the current word/qualifier being typed
    const beforeCursor = value.substring(0, cursorPos);
    const lastWord = beforeCursor.split(/\s+/).pop() || '';

    // If lastWord is empty, don't show suggestions
    if (!lastWord) return [];

    // Check if we're typing a qualifier
    const qualifierMatch = lastWord.match(/^(\w+):(.*)$/);

    if (qualifierMatch) {
        const qualifier = qualifierMatch[1];
        const partialValue = qualifierMatch[2];

        if (!qualifier) return [];

        const lowerQualifier = qualifier.toLowerCase();

        // Only show value suggestions for valid qualifiers
        const validQualifiers = ['type', 'sender', 'receiver', 'interface'];
        if (!validQualifiers.includes(lowerQualifier)) {
            return [];
        }

        // Suggest values for the qualifier
        let values: string[] = [];
        switch (lowerQualifier) {
            case 'type':
                values = props.suggestions.types;
                break;
            case 'sender':
                values = props.suggestions.senders;
                break;
            case 'receiver':
                values = props.suggestions.receivers;
                break;
            case 'interface':
                values = props.suggestions.interfaces;
                break;
        }

        // Filter values based on partial input
        const filteredValues = partialValue
            ? values.filter((v) => v.toLowerCase().includes(partialValue.toLowerCase()))
            : values;

        // Don't show suggestions if the typed value exactly matches an existing value
        if (
            partialValue &&
            filteredValues.length === 1 &&
            filteredValues[0]?.toLowerCase() === partialValue.toLowerCase()
        ) {
            return [];
        }

        return filteredValues.map((v) => ({
            type: 'value' as const,
            text: `${qualifier}:${v}`,
            qualifier,
            value: v,
        }));
    }

    // Suggest qualifiers only if typing at the start or the word doesn't contain ':'
    const qualifiers = ['type:', 'sender:', 'receiver:', 'interface:'];
    const filtered = qualifiers.filter((q) => q.startsWith(lastWord.toLowerCase()));

    // Don't show qualifier suggestions if the word already has a ':' but didn't match
    if (lastWord.includes(':')) {
        return [];
    }

    return filtered.map((q) => ({
        type: 'qualifier' as const,
        text: q,
        qualifier: q.replace(':', ''),
        value: '',
    }));
});

// Handle keyboard navigation
function handleKeyDown(event: KeyboardEvent) {
    if (!showSuggestions.value || currentSuggestions.value.length === 0) {
        if (event.key === 'ArrowDown') {
            showSuggestions.value = true;
            event.preventDefault();
        }
        return;
    }

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            selectedSuggestionIndex.value =
                (selectedSuggestionIndex.value + 1) % currentSuggestions.value.length;
            scrollToSelectedSuggestion();
            break;
        case 'ArrowUp':
            event.preventDefault();
            selectedSuggestionIndex.value =
                selectedSuggestionIndex.value === 0
                    ? currentSuggestions.value.length - 1
                    : selectedSuggestionIndex.value - 1;
            scrollToSelectedSuggestion();
            break;
        case 'Enter':
            event.preventDefault();
            const suggestion = currentSuggestions.value[selectedSuggestionIndex.value];
            if (suggestion) {
                applySuggestion(suggestion);
            }
            break;
        case 'Escape':
            event.preventDefault();
            showSuggestions.value = false;
            break;
    }
}

// Apply selected suggestion
function applySuggestion(suggestion: {
    type: string;
    text: string;
    qualifier: string;
    value: string;
}) {
    const value = localFilterValue.value;
    const cursorPos = inputRef.value?.selectionStart ?? value.length;
    const beforeCursor = value.substring(0, cursorPos);
    const afterCursor = value.substring(cursorPos);

    // Find the start of the current word
    const lastSpaceIndex = beforeCursor.lastIndexOf(' ');
    const wordStart = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;

    // Replace the current word with the suggestion
    localFilterValue.value =
        value.substring(0, wordStart) +
        suggestion.text +
        (suggestion.type === 'qualifier' ? '' : ' ') +
        afterCursor;

    showSuggestions.value = false;

    // Set cursor position after the inserted text
    nextTick(() => {
        if (inputRef.value) {
            const newPos =
                wordStart + suggestion.text.length + (suggestion.type === 'qualifier' ? 0 : 1);
            inputRef.value.setSelectionRange(newPos, newPos);
            inputRef.value.focus();
        }
    });
}

// Scroll to keep selected suggestion visible
function scrollToSelectedSuggestion() {
    nextTick(() => {
        const dropdown = dropdownRef.value;
        if (!dropdown) return;

        const selectedElement = dropdown.querySelector('[data-selected="true"]');
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });
}

// Show suggestions on focus only if there's already text
function handleFocus() {
    if (localFilterValue.value && currentSuggestions.value.length > 0) {
        showSuggestions.value = true;
    }
}

// Update suggestions when input changes - only show if there's text
watch(localFilterValue, (newValue) => {
    selectedSuggestionIndex.value = 0;
    if (newValue && currentSuggestions.value.length > 0) {
        showSuggestions.value = true;
    } else {
        showSuggestions.value = false;
    }
});
</script>

<template>
    <div class="relative w-full">
        <Search
            class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-20 h-4 w-4 -translate-y-1/2"
        />

        <!-- Styled text overlay (behind the input) -->
        <div
            v-if="localFilterValue"
            class="pointer-events-none absolute top-1/2 right-8 left-9 z-10 -translate-y-1/2 overflow-hidden text-sm whitespace-nowrap"
            v-html="styledText"
        ></div>

        <!-- Actual input (text made transparent when there's content) -->
        <Input
            ref="inputRef"
            v-model="localFilterValue"
            :placeholder="placeholder"
            :class="[
                'relative z-10 pr-8 pl-9',
                localFilterValue ? 'caret-foreground text-transparent' : '',
            ]"
            @keydown="handleKeyDown"
            @focus="handleFocus"
        />

        <button
            v-if="localFilterValue"
            @click="clearFilter"
            class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-20 -translate-y-1/2 transition-colors"
        >
            <X class="h-4 w-4" />
        </button>

        <!-- Suggestions dropdown -->
        <div
            v-if="showSuggestions && currentSuggestions.length > 0"
            ref="dropdownRef"
            class="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border shadow-lg"
        >
            <div
                v-for="(suggestion, index) in currentSuggestions"
                :key="index"
                :data-selected="index === selectedSuggestionIndex"
                @click="applySuggestion(suggestion)"
                @mouseenter="selectedSuggestionIndex = index"
                :class="[
                    'cursor-pointer px-3 py-2 text-sm transition-colors',
                    index === selectedSuggestionIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50',
                ]"
            >
                <span v-if="suggestion.type === 'qualifier'" class="text-primary font-medium">
                    {{ suggestion.text }}
                </span>
                <span v-else class="flex items-center gap-2">
                    <span class="text-muted-foreground">{{ suggestion.qualifier }}:</span>
                    <span class="font-medium">{{ suggestion.value }}</span>
                </span>
            </div>
        </div>
    </div>
</template>
