<script setup lang="ts">
import { ref, nextTick, watch, computed, onMounted } from 'vue';
import { useDatexRepl } from '@/composable/useDatexRepl';
import { ChevronRight, ChevronLeft, BanIcon, Loader2 } from '@lucide/vue';
import { activeEndpoint } from '@/lib/inspector/mod';
import { useShikiHighlighter } from '@/composable/useShikiHighlighter';
import { useColorMode } from '@vueuse/core';
import StandaloneWindowHeader from '@/components/Endpoints/StandaloneWindowHeader.vue';
import { useI18n } from 'vue-i18n';
import EndpointSearch from '@/components/Endpoints/EndpointSearch.vue';
import { useWindowControlsOverlay } from '@/utils/windowControlsOverlay';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const mode = useColorMode();
const { t } = useI18n();

const highlighter = await useShikiHighlighter();
const theme = computed(() => (mode.value === 'dark' ? 'DATEX Dark' : 'DATEX Light'));

const { entries, history, executeCommand, reset, suggestions, updateSuggestions } = useDatexRepl(
    () => activeEndpoint.value,
);

const currentInput = ref('');
const historyIdx = ref(-1);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const selectedIdx = ref(0);
const executingLong = ref(false);
const executing = ref(false);

const ghostText = computed(() => {
    const list = suggestions.value;
    if (!currentInput.value || list.length === 0) return '';

    const suggestion = list[selectedIdx.value];
    if (!suggestion) return '';

    const lastToken = currentInput.value.match(/([\w]+)$/)?.[0] ?? '';

    return suggestion.startsWith(lastToken) ? suggestion.slice(lastToken.length) : '';
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

function scrollDown() {
    scrollContainer.value?.scrollTo({
        top: scrollContainer.value.scrollHeight,
        behavior: 'instant',
    });
}

async function handleKeydown(e: KeyboardEvent) {
    const el = textareaRef.value;
    if (!el) return;

    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const code = currentInput.value;
        currentInput.value = '';
        let done = false;
        executing.value = true;
        // after 100ms, if the command is still executing, mark it as long executing
        setTimeout(() => {
            if (!done) executingLong.value = true;
        }, 100);
        await executeCommand(code);
        done = true;
        historyIdx.value = -1;
        scrollDown();
        setTimeout(scrollDown, 0);
        setTimeout(focusInput, 0);

        executing.value = false;
        executingLong.value = false;
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        // if (suggestions.value.length > 0) {
        //     selectedIdx.value = (selectedIdx.value + 1) % suggestions.value.length;
        // }
        if (ghostText.value) {
            e.preventDefault();
            currentInput.value += ghostText.value;
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
        currentInput.value = history.value[historyIdx.value] ?? '';
    } else if (e.key === 'ArrowDown' && historyIdx.value >= 0) {
        e.preventDefault();
        historyIdx.value--;
        currentInput.value = historyIdx.value === -1 ? '' : (history.value[historyIdx.value] ?? '');
    }
}

watch(currentInput, (val) => {
    resizeTextarea();
    updateSuggestions(val);
    selectedIdx.value = suggestions.value.length ? 0 : -1;
});
onMounted(() => {
    resizeTextarea();
    focusInput();
    scrollDown();
});

function focusInput() {
    textareaRef.value?.focus();
}

function highlightDatexText(content: string | null) {
    if (content == null) return '';
    return highlighter.codeToHtml(content, { lang: 'datex', theme: theme.value });
}
const controlsOverlayEnabled = useWindowControlsOverlay();
</script>

<template>
    <StandaloneWindowHeader :title="t('nav.repl')" />
    <div class="bg-page text-primary relative flex h-full flex-col pt-4 overflow-hidden">
        <div class="px-4 pb-0 flex justify-end gap-3 items-center">
            <div :class="controlsOverlayEnabled && 'absolute right-3 top-3'">
                <Tooltip>
                    <TooltipTrigger>
                        <button
                            @click="reset"
                            class="p-0 not-disabled:cursor-pointer opacity-70 disabled:opacity-20"
                            :disabled="!entries.length"
                        >
                            <BanIcon :size="16" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" :avoidCollisions="false">
                        <p>Clear</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <div v-if="!controlsOverlayEnabled">
                <EndpointSearch />
            </div>
        </div>

        <div
            ref="scrollContainer"
            class="flex-1 flex flex-col gap-2 overflow-y-auto p-4 pt-3 font-mono text-sm"
            :class="{ 'pt-0': !controlsOverlayEnabled }"
        >
            <template v-for="(entry, i) in entries" :key="i">
                <div
                    class="history-item text-sm break-all whitespace-pre-wrap no-drag"
                    v-if="entry.type != 'output' || entry.content"
                >
                    <div
                        v-if="entry.type === 'input'"
                        class="text-muted-foreground flex items-start gap-2"
                    >
                        <div>
                            <Loader2
                                v-if="i === entries.length - 1 && executingLong"
                                class="absolute mt-0.5 h-4 w-4 animate-spin"
                            />
                            <ChevronRight
                                :size="18"
                                class="shrink-0"
                                :class="{ 'opacity-0': i === entries.length - 1 && executingLong }"
                            />
                        </div>
                        <span
                            class="[&>pre]:bg-transparent! [&_code]:whitespace-break-spaces"
                            v-html="highlightDatexText(entry.content)"
                        ></span>
                    </div>
                    <div
                        v-else-if="entry.type === 'output'"
                        class="text-primary flex gap-2 items-start"
                    >
                        <ChevronLeft :size="18" class="opacity-50 shrink-0" />
                        <span
                            class="[&>pre]:bg-transparent! [&_code]:whitespace-break-spaces"
                            v-html="highlightDatexText(entry.content)"
                        ></span>
                    </div>

                    <div
                        v-else
                        class="card border-rose-500/20 border-2 bg-rose-500/20 text-rose-500 border ml-6"
                    >
                        {{ entry.content }}
                    </div>
                </div>
            </template>

            <div v-if="!executing" class="flex items-start gap-2" @click="focusInput()">
                <span class="text-dim">
                    <ChevronRight :size="18" />
                </span>

                <div class="relative flex-1">
                    <div
                        class="text-faint pointer-events-none absolute inset-0 font-mono whitespace-pre"
                        aria-hidden="true"
                    >
                        <span class="opacity-0">{{ currentInput }}</span
                        >{{ ghostText }}
                    </div>
                    <textarea
                        ref="textareaRef"
                        v-model="currentInput"
                        @keydown="handleKeydown"
                        @input="autoResize"
                        rows="1"
                        spellcheck="false"
                        class="text-primary placeholder:text-primary/30 relative block w-full resize-none border-none bg-transparent font-mono leading-[1.5] outline-none"
                        placeholder="Type DATEX commands..."
                    ></textarea>
                </div>
            </div>
            <div class="w-full h-fit flex-1" @click="focusInput()"></div>

            <!--<div
                v-if="suggestions.length > 0"
                class="card border-card absolute bottom-full left-8 mb-2 flex max-h-40 w-48 flex-col overflow-y-auto p-1 shadow-xl"
            >
              <div
                  v-for="(s, i) in suggestions"
                  :key="s"
                  :class="[
                      'cursor-pointer rounded px-2 py-1 text-xs transition-colors',
                      i === selectedIdx
                          ? 'bg-primary text-primary-foreground'
                          : 'text-dim hover:bg-muted',
                  ]"
              >
                  {{ s }}
              </div>
            </div>-->
        </div>
    </div>
</template>
