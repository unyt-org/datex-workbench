<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Languages, Check } from 'lucide-vue-next';
import { SUPPORTED_LOCALES, setLocale, type LocaleCode } from '@/i18n';

const { locale } = useI18n();
const isOpen = ref(false);

const currentLabel = computed(
    () => SUPPORTED_LOCALES.find((l) => l.code === locale.value)?.label ?? 'English',
);

function selectLocale(code: LocaleCode) {
    setLocale(code);
    isOpen.value = false;
}

function toggleMenu() {
    isOpen.value = !isOpen.value;
}

function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-switcher')) {
        isOpen.value = false;
    }
}

import { onMounted, onUnmounted } from 'vue';
onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));
</script>

<template>
    <div class="lang-switcher relative">
        <button
            class="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted transition"
            @click="toggleMenu"
        >
            <Languages class="size-3.5" />
            {{ currentLabel }}
        </button>

        <div
            v-if="isOpen"
            class="absolute right-0 top-full mt-1 z-50 min-w-32 rounded-md border border-border bg-popover shadow-md py-1"
        >
            <button
                v-for="lang in SUPPORTED_LOCALES"
                :key="lang.code"
                class="flex w-full items-center justify-between px-3 py-1.5 text-xs text-foreground hover:bg-muted transition"
                @click="selectLocale(lang.code)"
            >
                <span>{{ lang.label }}</span>
                <Check v-if="locale === lang.code" class="size-3.5 text-primary" />
            </button>
        </div>
    </div>
</template>
