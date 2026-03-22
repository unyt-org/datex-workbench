<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

defineProps<{
    tooltip: string;
    asChild?: boolean;
}>();
</script>

<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger :as-child="asChild ?? true">
                <slot />
            </TooltipTrigger>
            <TooltipContent>
                {{ tooltip }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>
