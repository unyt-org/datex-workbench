<script setup lang="ts">
import { useEndpointConnectionStatus } from '@/lib/composables/use-endpoint-connection-status.ts';
import { Endpoint } from '@unyt/datex/lib';
import { computed, ref, watch } from 'vue';
import { connectedInspectorInstances } from '@/lib/inspector/mod.ts';

const props = withDefaults(
    defineProps<{
        endpoint?: Endpoint | null;
        compact?: boolean;
        variant?: 'colored-name' | 'compact' | 'default';
        connectionStatus?: boolean;
    }>(),
    {
        connectionStatus: true,
    },
);

const { isConnected, connectionLostCount, endpointName, pollCount, refresh } =
    useEndpointConnectionStatus(() => (props.connectionStatus ? props.endpoint : null));

const initialPollCount = ref(pollCount.value);
const initialConnectionLostCount = ref(connectionLostCount.value);

const textColor = computed(() => {
    if (isConnected.value) {
        return hasInspectorSession.value ? 'text-blue-400' : 'text-green-500';
    } else {
        return hasInspectorSession.value && pollCount.value > 0
            ? 'text-rose-500'
            : 'text-foreground';
    }
});

// when endpoint has changed, update the initial counts
watch(
    () => props.endpoint,
    () => {
        initialPollCount.value = pollCount.value;
        initialConnectionLostCount.value = connectionLostCount.value;
    },
);
const hasInspectorSession = computed(() => connectedInspectorInstances.has(props.endpoint!));
</script>

<template>
    <div
        class="flex items-start gap-2"
        :class="variant == 'colored-name' ? 'flex-row-reverse justify-between' : ''"
    >
        <span
            v-if="endpoint && connectionStatus"
            class="relative flex cursor-pointer select-none"
            @click="
                refresh();
                $event.stopPropagation();
            "
        >
            <span :class="textColor">●</span>
            <span
                v-if="connectionLostCount != initialConnectionLostCount"
                :key="connectionLostCount"
                class="absolute inline-flex h-full w-full animate-ping-once-long rounded-full opacity-75"
                :class="textColor"
            >
                ●
            </span>
            <span
                v-if="isConnected && pollCount != initialPollCount"
                :key="pollCount"
                class="absolute inline-flex h-full w-full animate-ping-once rounded-ful opacity-75"
                :class="textColor"
            >
                ●
            </span>
        </span>
        <span v-if="!endpoint" class="relative flex select-none"> ... </span>

        <span>
            <span :class="variant == 'colored-name' ? textColor : ''">{{
                endpoint?.toString()
            }}</span>
            <span
                v-if="variant != 'compact'"
                :class="variant == 'colored-name' ? 'text-foreground' : 'text-muted-foreground'"
            >
                &nbsp;{{ endpointName }}
            </span>
        </span>
    </div>
</template>
