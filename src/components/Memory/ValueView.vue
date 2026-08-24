<template>
    {{ currentValue }}
</template>

<script setup lang="ts">
import type { Shared } from '@unyt/datex';
import { ref } from 'vue';
const props = defineProps<{
    value: Shared.BaseSharedContainer<unknown, Shared.SharedContainerMutability>;
}>();
console.log('value', props.value);

const currentValue = ref(props.value.value);

// @ts-expect-error fixme when types are updated
props.value.observe((newValue) => {
    console.log('value changed', newValue);
    currentValue.value = null; // TODO: this is a workaround to force to re-render
    currentValue.value = props.value.value;
});
</script>
