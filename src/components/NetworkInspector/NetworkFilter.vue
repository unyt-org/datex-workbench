<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-vue-next';

interface TableRow {
    direction: string;
    blockType: string;
    sender: string;
    receiver: string;
    timestamp: string;
    size: number;
    isEncrypted: boolean;
    isSigned: boolean;
    interface: string;
    capturedAt: number;
}

const props = defineProps<{
    rows: TableRow[];
}>();

const emit = defineEmits<{
    'filter-change': [filteredRows: TableRow[]];
}>();

// Filter state
const filterQuery = ref('');
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(0);
const filterInputRef = ref<HTMLInputElement | null>(null);

// Available filter keys
const filterKeys = ['type', 'interface', 'sender', 'receiver', 'direction', 'encrypted', 'signed'];

// Parse filter query into structured filters
interface ParsedFilter {
    key?: string;
    value: string;
}

function parseFilters(query: string): ParsedFilter[] {
    const filters: ParsedFilter[] = [];
    const keyValueRegex = /(\w+):(["'][^"']+["']|\S+)/g;
    let match;
    let lastIndex = 0;

    // Extract key:value pairs
    while ((match = keyValueRegex.exec(query)) !== null) {
        // Add any plain text before this match
        if (match.index > lastIndex) {
            const plainText = query.substring(lastIndex, match.index).trim();
            if (plainText) {
                filters.push({ value: plainText });
            }
        }
        
        let value = match[2];
        if (!value) continue;
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        const key = match[1];
        if (!key) continue;
        
        filters.push({ key: key.toLowerCase(), value });
        lastIndex = match.index + match[0].length;
    }

    // Add any remaining plain text
    if (lastIndex < query.length) {
        const plainText = query.substring(lastIndex).trim();
        if (plainText) {
            filters.push({ value: plainText });
        }
    }

    return filters;
}

// Get unique values for a given key from current rows
function getUniqueValues(key: string): string[] {
    const values = new Set<string>();
    
    props.rows.forEach(row => {
        switch (key) {
            case 'type':
                values.add(row.blockType);
                break;
            case 'interface':
                values.add(row.interface);
                break;
            case 'sender':
                values.add(row.sender);
                break;
            case 'receiver':
                values.add(row.receiver);
                break;
            case 'direction':
                values.add(row.direction);
                break;
            case 'encrypted':
                values.add(row.isEncrypted ? 'yes' : 'no');
                break;
            case 'signed':
                values.add(row.isSigned ? 'yes' : 'no');
                break;
        }
    });
    
    return Array.from(values).sort();
}

// Generate suggestions based on current input
const suggestions = computed(() => {
    const query = filterQuery.value;
    if (!query) return [];

    const cursorPosition = filterInputRef.value?.selectionStart || query.length;
    const textBeforeCursor = query.substring(0, cursorPosition);
    
    // Check if typing a key (word followed by :)
    const keyMatch = textBeforeCursor.match(/(\w+):([^\s]*)$/);
    if (keyMatch && keyMatch[1] && keyMatch[2] !== undefined) {
        const key = keyMatch[1].toLowerCase();
        const partialValue = keyMatch[2];
        
        if (filterKeys.includes(key)) {
            // Suggest values for this key
            const values = getUniqueValues(key);
            return values
                .filter(v => v.toLowerCase().includes(partialValue.toLowerCase()))
                .map(v => ({ type: 'value', key, value: v }));
        }
    }
    
    // Check if typing a key (partial key before :)
    const partialKeyMatch = textBeforeCursor.match(/(\w+)$/);
    if (partialKeyMatch && partialKeyMatch[1]) {
        const partial = partialKeyMatch[1].toLowerCase();
        return filterKeys
            .filter(k => k.startsWith(partial))
            .map(k => ({ type: 'key', key: k }));
    }
    
    return [];
});

// Apply suggestion
function applySuggestion(suggestion: any) {
    const cursorPosition = filterInputRef.value?.selectionStart || filterQuery.value.length;
    const textBeforeCursor = filterQuery.value.substring(0, cursorPosition);
    const textAfterCursor = filterQuery.value.substring(cursorPosition);
    
    if (suggestion.type === 'key') {
        // Replace partial key with full key
        const newText = textBeforeCursor.replace(/(\w+)$/, `${suggestion.key}:`);
        filterQuery.value = newText + textAfterCursor;
        nextTick(() => {
            if (filterInputRef.value) {
                filterInputRef.value.focus();
                filterInputRef.value.setSelectionRange(newText.length, newText.length);
            }
        });
    } else if (suggestion.type === 'value') {
        // Replace partial value with full value
        const needsQuotes = suggestion.value.includes(' ');
        const valueStr = needsQuotes ? `"${suggestion.value}"` : suggestion.value;
        const newText = textBeforeCursor.replace(/(\w+):([^\s]*)$/, `$1:${valueStr} `);
        filterQuery.value = newText + textAfterCursor;
        nextTick(() => {
            if (filterInputRef.value) {
                filterInputRef.value.focus();
                filterInputRef.value.setSelectionRange(newText.length, newText.length);
            }
        });
    }
    
    showSuggestions.value = false;
    selectedSuggestionIndex.value = 0;
}

// Handle keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
    if (!showSuggestions.value || suggestions.value.length === 0) return;
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestionIndex.value = 
            (selectedSuggestionIndex.value + 1) % suggestions.value.length;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestionIndex.value = 
            (selectedSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
    } else if (e.key === 'Enter' && suggestions.value.length > 0) {
        e.preventDefault();
        applySuggestion(suggestions.value[selectedSuggestionIndex.value]);
    } else if (e.key === 'Escape') {
        showSuggestions.value = false;
    }
}

// Watch filter input for suggestions
watch(filterQuery, () => {
    showSuggestions.value = filterQuery.value.length > 0 && suggestions.value.length > 0;
    selectedSuggestionIndex.value = 0;
});

// Filter rows based on query
const filteredRows = computed(() => {
    if (!filterQuery.value.trim()) return props.rows;
    
    const filters = parseFilters(filterQuery.value);
    
    return props.rows.filter(row => {
        return filters.every(filter => {
            if (!filter.key) {
                // Plain text search - search across all string fields
                const searchText = filter.value.toLowerCase();
                return (
                    row.blockType.toLowerCase().includes(searchText) ||
                    row.sender.toLowerCase().includes(searchText) ||
                    row.receiver.toLowerCase().includes(searchText) ||
                    row.interface.toLowerCase().includes(searchText) ||
                    row.direction.toLowerCase().includes(searchText)
                );
            }
            
            // Key:value filter
            const value = filter.value.toLowerCase();
            switch (filter.key) {
                case 'type':
                    return row.blockType.toLowerCase() === value;
                case 'interface':
                    return row.interface.toLowerCase() === value;
                case 'sender':
                    return row.sender.toLowerCase().includes(value);
                case 'receiver':
                    return row.receiver.toLowerCase().includes(value);
                case 'direction':
                    return row.direction === value;
                case 'encrypted':
                    return (value === 'yes' || value === 'true') ? row.isEncrypted : !row.isEncrypted;
                case 'signed':
                    return (value === 'yes' || value === 'true') ? row.isSigned : !row.isSigned;
                default:
                    return true;
            }
        });
    });
});

// Emit filtered results when they change
watch(filteredRows, (newFiltered) => {
    emit('filter-change', newFiltered);
}, { immediate: true });

// Handle blur event
function handleBlur() {
    setTimeout(() => showSuggestions.value = false, 200);
}

// Clear filter
function clearFilter() {
    filterQuery.value = '';
}
</script>

<template>
    <div class="relative">
        <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                ref="filterInputRef"
                v-model="filterQuery"
                placeholder='Filter (e.g., type:Traceback)'
                class="pl-9 pr-8"
                @keydown="handleKeyDown"
                @focus="showSuggestions = filterQuery.length > 0 && suggestions.length > 0"
                @blur="handleBlur"
            />
            <button
                v-if="filterQuery"
                @click="clearFilter"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
                <X class="h-4 w-4" />
            </button>
        </div>
        
        <!-- Suggestions Dropdown -->
        <div
            v-if="showSuggestions && suggestions.length > 0"
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
            <div
                v-for="(suggestion, index) in suggestions"
                :key="index"
                @click="applySuggestion(suggestion)"
                :class="[
                    'cursor-pointer px-3 py-2 text-sm',
                    index === selectedSuggestionIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                ]"
            >
                <span v-if="suggestion.type === 'key'" class="font-medium">
                    {{ suggestion.key }}:
                </span>
                <span v-else-if="suggestion.type === 'value'">
                    <span class="text-muted-foreground">{{ suggestion.key }}:</span>
                    <span class="ml-1 font-medium">{{ (suggestion as any).value }}</span>
                </span>
            </div>
        </div>
    </div>
</template>
