<template>
    <pre class="[&>pre]:bg-transparent!" v-html="highlightDatexText(currentValue)"></pre>
</template>

<script setup lang="ts">
import { useShikiHighlighter } from '@/composable/useShikiHighlighter';
import { Datex } from '@/lib/runtime';
import { Tagged } from '@unyt/datex/lib';

import { useColorMode } from '@vueuse/core';
import { computed, ref } from 'vue';
import type { BaseSharedContainer } from '@unyt/datex/shared-container';
import type { Shared } from '@unyt/datex';
const mode = useColorMode();

const theme = computed(() => (mode.value === 'dark' ? 'DATEX Dark' : 'DATEX Light'));

const props = defineProps<{
    value: BaseSharedContainer<unknown, Shared.SharedContainerMutability>;
}>();

const currentValue = ref(formatValue(props.value.value));
const highlighter = await useShikiHighlighter();

function highlightDatexText(content: string | null) {
    if (content == null) return '';
    return highlighter.codeToHtml(content, { lang: 'datex', theme: theme.value });
}

function formatValue(value: unknown) {
    try {
        return Datex.valueToString(value, {
            formatting_options: {
                mode: new Tagged('Pretty', {
                    indent: 4,
                    indent_type: new Tagged('Spaces'),
                }),
                json_compat: false,
                colorized: false,
            },
            resolve_slots: false,
        });
    } catch (error) {
        console.error('Failed to format value', error);
        return '?';
    }
}

try {
    props.value.observe((newValue) => {
        console.log('value changed', newValue);
        setTimeout(() => {
            currentValue.value = formatValue(props.value.value);
        }, 0);
    });
} catch (error) {
    console.error('Failed to observe value', error);
}
</script>
