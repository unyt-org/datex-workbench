<script setup lang="ts">
import { ref, nextTick, watch, computed, onMounted } from 'vue';
import { useDatexRepl } from '@/composable/useDatexRepl';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Settings, ChevronRight, ChevronLeft, Trash2 } from 'lucide-vue-next';

const { entries, history, executeCommand, clear, suggestions, updateSuggestions } = useDatexRepl();

const currentInput = ref('');
const historyIdx = ref(-1);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const selectedIdx = ref(0);

const ghostText = computed(() => {
    if (!currentInput.value || !suggestions.value.length) return '';
    const suggestion = suggestions.value[selectedIdx.value];

    const lastToken = currentInput.value.match(/([\w.]+)$/)?.[0] || '';

    if (suggestion.startsWith(lastToken)) {
        return suggestion.slice(lastToken.length);
    }
    return '';
});

const autoResize = () => {
    if (!textareaRef.value) return;

    textareaRef.value.style.height = 'auto';

    const newHeight = Math.min(textareaRef.value.scrollHeight, 300);
    textareaRef.value.style.height = `${newHeight}px`;

    textareaRef.value.style.overflowY = textareaRef.value.scrollHeight > 300 ? 'auto' : 'hidden';
};

const resizeTextarea = async () => {
    await nextTick();
    autoResize();
};

function handleKeydown(e: KeyboardEvent) {
    const el = textareaRef.value;
    if (!el) return;

    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const code = currentInput.value;
        currentInput.value = '';
        executeCommand(code);
        historyIdx.value = -1;
        nextTick(() =>
            scrollContainer.value?.scrollTo({
                top: scrollContainer.value.scrollHeight,
                behavior: 'smooth',
            }),
        );
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        if (suggestions.value.length > 0) {
            selectedIdx.value = (selectedIdx.value + 1) % suggestions.value.length;
        }
    }

    if (e.key === 'ArrowRight' && el.selectionStart === currentInput.value.length) {
        if (ghostText.value) {
            e.preventDefault();
            currentInput.value += ghostText.value;
        }
    }

    if (e.key === 'ArrowUp' && historyIdx.value < history.value.length - 1) {
        e.preventDefault();
        historyIdx.value++;
        currentInput.value = history.value[historyIdx.value];
    } else if (e.key === 'ArrowDown' && historyIdx.value >= 0) {
        e.preventDefault();
        historyIdx.value--;
        currentInput.value = historyIdx.value === -1 ? '' : history.value[historyIdx.value];
    }
}

watch(currentInput, (val) => {
    resizeTextarea();
    updateSuggestions(val);
    selectedIdx.value = 0;
});
onMounted(() => {
    resizeTextarea();
});
</script>

<template>
    <div class="bg-page text-primary relative flex h-full flex-col font-mono text-sm">
        <div class="absolute top-3 right-3 z-20">
            <Popover>
                <PopoverTrigger as-child>
                    <button class="btn-icon border-card bg-card">
                        <Settings class="h-4 w-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" class="card w-64">
                    <PointerPreferences />
                </PopoverContent>
            </Popover>
        </div>
        <div ref="scrollContainer" class="flex-1 space-y-2 overflow-y-auto p-4">
            <div
                v-for="(entry, i) in entries"
                :key="i"
                class="text-sm break-all whitespace-pre-wrap"
            >
                <div v-if="entry.type === 'input'" class="text-muted-foreground flex gap-2">
                    <ChevronRight size="14" class="mt-1 opacity-50" />
                    <span class="text-primary">{{ entry.content }}</span>
                </div>
                <div v-else-if="entry.type === 'output'" class="text-primary flex gap-2">
                    <ChevronLeft size="14" class="text-dim mt-1" />
                    <span v-html="entry.content" class="text-primary"></span>
                </div>

                <div
                    v-else
                    class="card border-destructive/30 bg-destructive/10 text-destructive border"
                >
                    {{ entry.content }}
                </div>
            </div>
        </div>
        <div class="border-card bg-card border-t p-3">
            <div class="flex items-center gap-2">
                <span class="text-dim">
                    <ChevronRight size="18" />
                </span>

                <div class="relative flex-1">
                    <div
                        class="text-faint pointer-events-none absolute inset-0 px-0 py-2 whitespace-pre"
                        aria-hidden="true"
                    >
                        <span class="opacity-0">{{ currentInput }}</span>
                        {{ ghostText }}
                    </div>
                    <textarea
                        ref="textareaRef"
                        v-model="currentInput"
                        @keydown="handleKeydown"
                        @input="autoResize"
                        rows="1"
                        spellcheck="false"
                        class="text-primary placeholder:text-faint relative block w-full resize-none border-none bg-transparent py-2 outline-none"
                        placeholder="Type DATEX commands..."
                        :style="{ maxHeight: '300px', overflowY: 'auto' }"
                    ></textarea>
                </div>

                <button @click="clear" class="btn-icon">
                    <Trash2 size="16" />
                </button>
            </div>
            <div
                v-if="suggestions.length > 1"
                class="card border-card absolute bottom-full left-10 mb-2 flex gap-2 p-1 shadow-xl"
            >
                <div
                    v-for="(s, i) in suggestions"
                    :key="s"
                    :class="[
                        'rounded px-2 py-0.5 text-[10px]',
                        i === selectedIdx ? 'bg-primary text-primary-foreground' : 'text-dim',
                    ]"
                >
                    {{ s }}
                </div>
            </div>
        </div>
    </div>
</template>
