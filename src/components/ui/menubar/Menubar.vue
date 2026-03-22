<script setup lang="ts">
import { cn } from '@/lib/utils';
import { reactiveOmit } from '@vueuse/core';
import type { MenubarRootEmits, MenubarRootProps } from 'reka-ui';
import { MenubarRoot, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

const props = defineProps<MenubarRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<MenubarRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
    <MenubarRoot
        v-bind="forwarded"
        :class="cn('bg-background flex items-center gap-x-1 p-1', props.class)"
    >
        <slot />
    </MenubarRoot>
</template>
