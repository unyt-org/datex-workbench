<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    value: number;
    secondaryValue?: number;
    classPrimary?: string;
    classSecondary?: string;
}>();

const width = computed(() => `${Math.min(100, Math.max(0, props.value))}%`);
const secondaryWidth = computed(() => `${Math.min(100, Math.max(0, (props.secondaryValue ?? 0) - props.value))}%`);
</script>
<template>
    <div
        class="h-8 w-full overflow-hidden rounded-md bg-muted flex"
        role="progressbar"
        :aria-valuenow="value"
        aria-valuemin="0"
        aria-valuemax="100"
    >
        <div
            class="stripes h-full bg-primary transition-[width] duration-300"
            :class="props.classPrimary"
            :style="{ width }"
        ></div>
        <div
            class="stripes h-full bg-blue-400 transition-[width] duration-300"
            :class="props.classSecondary"
            :style="{ width: secondaryWidth }"
        ></div>
    </div>
</template>

<style scoped>
.stripes {
    background-image: repeating-linear-gradient(
        45deg,
        color-mix(in srgb, currentColor 4%, transparent) 0 8px,
        transparent 8px 16px
    );
    background-size: 22.6px 22.6px;
}


@keyframes stripes {
    from { background-position: 0 0; }
    to   { background-position: 22.6px 0; }
}
</style>
