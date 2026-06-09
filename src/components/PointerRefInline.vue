<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePointerPreferences } from '@/composable/usePointerPreferences';
import { getTypeName } from '@/lib/pointer-types';
import type { DIF } from '@unyt/datex';
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
interface PointerRefInlineProps {
    pointerId: string;
}

const props = defineProps<PointerRefInlineProps>();

// Emits
const emit = defineEmits<{
    click: [pointerId: string];
}>();

// Inject the pointers map
const pointers = inject<Map<string, DIF.Definitions.DIFValueContainer>>('pointers');

// Use preferences composable
const { preferences } = usePointerPreferences();

// Compute display ID based on preferences
const displayId = computed(() => {
    if (preferences.value.show_full_pointer_ids) {
        return props.pointerId;
    }

    // Show abbreviated ID (last 4 chars)
    const numericPart = props.pointerId.slice(1); // Remove $
    if (numericPart.length > 4) {
        return `$${numericPart.slice(-4)}`;
    }

    return props.pointerId;
});

// Get the value preview for the pointer
const valuePreview = computed(() => {
    if (!pointers) return '';

    const difValueContainer = pointers.get(props.pointerId);
    if (!difValueContainer) return '';

    // Extract value from DIF container
    const value =
        typeof difValueContainer === 'object' &&
        difValueContainer !== null &&
        'value' in difValueContainer
            ? (difValueContainer as Record<string, unknown>).value
            : difValueContainer;

    const typeName = getTypeName(difValueContainer);

    // Format preview based on type
    if (typeName === 'text') return `"${value}"`;
    if (typeName === 'boolean') return value ? 'true' : 'false';
    if (typeName === 'integer' || typeName === 'decimal') return String(value);
    if (typeName === 'null') return 'null';
    if (typeName === 'list') return '[...]';
    if (typeName === 'map' || typeName === 'object') return '{...}';

    return String(value);
});

// Handle click
function handleClick() {
    emit('click', props.pointerId);
}
</script>

<template>
    <TooltipProvider :delay-duration="300">
        <Tooltip>
            <TooltipTrigger as-child>
                <button
                    @click.stop="handleClick"
                    class="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 inline-flex cursor-pointer items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium transition-colors"
                >
                    <span class="font-mono">{{ displayId }}</span>
                    <span v-if="valuePreview" class="text-foreground/60 font-normal"
                        >→ {{ valuePreview }}</span
                    >
                </button>
            </TooltipTrigger>
            <TooltipContent>
                <p class="font-mono text-xs">{{ pointerId }}</p>
                <p v-if="valuePreview" class="text-muted-foreground text-xs">
                    {{ t('common.value') }}: {{ valuePreview }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs">{{ t('pointer.clickToJump') }}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>
