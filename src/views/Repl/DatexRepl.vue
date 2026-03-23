<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue';
import { Datex } from '@/lib/runtime';
import { useDatexRepl } from '@/components/useDatexRepl';

const { entries, history, executeCommand, clear, suggestions, updateSuggestions } = useDatexRepl();

const currentInput = ref('');
const historyIdx = ref(-1);
const scrollContainer = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const selectedSuggestion = ref(0);
const isNavigatingSuggestions = ref(false);

async function handleEnter(e: KeyboardEvent) {
    if (e.shiftKey) return; // multiline with Shift+Enter (Requirement #82)
    e.preventDefault();

    const code = currentInput.value.trim();
    if (!code) return;

    await executeCommand(code);
    currentInput.value = '';
    historyIdx.value = -1;

    await nextTick();
    if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
}

function setInputValueAndMoveCursor(value: string) {
    currentInput.value = value;

    nextTick(() => {
        requestAnimationFrame(() => {
            const el = textareaRef.value;
            if (!el) return;

            el.focus();
            const end = el.value.length;
            el.setSelectionRange(end, end);
        });
    });
}

function handleUp() {
    if (suggestions.value.length && isNavigatingSuggestions.value) {
        selectedSuggestion.value =
            (selectedSuggestion.value - 1 + suggestions.value.length) % suggestions.value.length;
        return;
    }

    if (suggestions.value.length) {
        isNavigatingSuggestions.value = true;
        selectedSuggestion.value = suggestions.value.length - 1;
        return;
    }

    if (history.value.length > 0 && historyIdx.value < history.value.length - 1) {
        historyIdx.value++;
        setInputValueAndMoveCursor(history.value[historyIdx.value]);
    }
}

function handleDown() {
    if (suggestions.value.length && isNavigatingSuggestions.value) {
        selectedSuggestion.value = (selectedSuggestion.value + 1) % suggestions.value.length;
        return;
    }

    if (suggestions.value.length) {
        isNavigatingSuggestions.value = true;
        selectedSuggestion.value = 0;
        return;
    }

    if (historyIdx.value > 0) {
        historyIdx.value--;
        setInputValueAndMoveCursor(history.value[historyIdx.value]);
    } else {
        historyIdx.value = -1;
        setInputValueAndMoveCursor('');
    }
}

function handleTab(e: KeyboardEvent) {
    if (!suggestions.value.length) return;
    e.preventDefault();

    setInputValueAndMoveCursor(suggestions.value[selectedSuggestion.value]);

    isNavigatingSuggestions.value = false;
}

function handleEscape() {
    isNavigatingSuggestions.value = false;
}

// const ghostText = computed(() => {
//     const s = suggestions.value[0];
//     if (!s || !currentInput.value) return '';
//     if (!s.startsWith(currentInput.value)) return '';
//     return s.slice(currentInput.value.length);
// });

watch(currentInput, (val) => {
    updateSuggestions(val);
    selectedSuggestion.value = 0;
    isNavigatingSuggestions.value = false;
});
</script>

<template>
    <div
        class="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-200"
    >
        <div ref="scrollContainer" class="flex-1 space-y-2 overflow-y-auto p-4">
            <div v-for="(entry, i) in entries" :key="i" class="whitespace-pre-wrap">
                <div v-if="entry.type === 'input'" class="flex gap-2 text-blue-400">
                    <span class="shrink-0 opacity-50">❯</span>
                    <span>{{ entry.content }}</span>
                </div>

                <div
                    v-else-if="entry.type === 'output'"
                    class="flex items-start gap-2 text-emerald-400"
                >
                    <span class="mt-1 shrink-0 opacity-50">◀</span>
                    <span v-if="entry.content" v-html="entry.content"></span>
                    <span v-else class="italic opacity-50">no result</span>
                </div>
                <div
                    v-else-if="entry.type === 'error'"
                    class="flex gap-2 rounded border border-red-500/20 bg-red-500/10 p-2 text-red-400"
                >
                    <span class="shrink-0">✕</span>
                    <span>{{ entry.content }}</span>
                </div>
            </div>
        </div>

        <div class="relative flex items-end gap-2 border-t border-zinc-800 bg-zinc-900 p-2">
            <button
                @click="clear"
                class="rounded p-2 text-zinc-500 transition-colors hover:bg-zinc-800"
                title="Clear Console"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
            </button>

            <textarea
                ref="textareaRef"
                v-model="currentInput"
                @keydown.enter.exact="handleEnter"
                @keydown.up.exact="handleUp"
                @keydown.down.exact="handleDown"
                @keydown.tab.prevent="handleTab"
                @keydown.esc="handleEscape"
                rows="1"
                class="flex-1 resize-none border-none bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600"
                placeholder="Type DATEX command and press Enter..."
            ></textarea>
            <div
                v-if="suggestions.length"
                class="absolute bottom-full left-2 mb-1 w-64 rounded-md border border-zinc-700 bg-zinc-800 text-xs shadow-lg"
            >
                <div
                    v-for="(s, i) in suggestions"
                    :key="i"
                    :class="[
                        'cursor-pointer px-3 py-1.5',
                        i === selectedSuggestion ? 'bg-zinc-700' : 'hover:bg-zinc-700',
                    ]"
                    @click="setInputValueAndMoveCursor(s)"
                >
                    {{ s }}
                </div>
            </div>
        </div>
    </div>
</template>
