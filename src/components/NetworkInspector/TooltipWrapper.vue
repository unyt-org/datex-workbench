<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

withDefaults(
    defineProps<{
        tooltip: string;
        asChild?: boolean;
    }>(),
    {
        asChild: true,
    },
);
</script>

<template>
    <Tooltip>
        <TooltipTrigger :as-child="asChild ?? true">
            <slot />
        </TooltipTrigger>
        <TooltipContent>
            {{ tooltip }}
        </TooltipContent>
    </Tooltip>
</template>
