<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const props = withDefaults(defineProps<{
    tooltip: string;
    asChild?: boolean;
}>(), {
    asChild: true,
});
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
