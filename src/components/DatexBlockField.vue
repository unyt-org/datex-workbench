<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Props {
  backgroundColor?: string;
  text?: string;
  span?: number;
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: 'green',
  text: 'Test',
  span: 1,
});
</script>

<template>
  <Tooltip>
  <TooltipTrigger class="Block" :style="{
      backgroundColor: props.backgroundColor,
      gridColumn: `span ${props.span > 6? 6 : props.span}`
    }">{{ props.text }}</TooltipTrigger>
  <TooltipContent>
    <p>
      More Info
    </p>
  </TooltipContent>
</Tooltip>
</template>

<style scoped>
.Block {
  grid-column: span 2;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: lightpink;
}
</style>
