<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface InterfaceProperties {
    interface_type?: string;
    channel?: string;
    name?: string;
    direction?: string;
    round_trip_time?: number;
    max_bandwidth?: number;
    [key: string]: unknown;
}

interface EndpointInterface {
    uuid: string;
    properties?: InterfaceProperties;
    is_waiting_for_socket_connections?: boolean;
}

interface Props {
    interfaces?: EndpointInterface[];
}

defineProps<Props>();

const { t } = useI18n();

function formatBandwidth(value: number): string {
    if (value === 4294967295) return t('common.unlimited');
    if (value >= 1000) return `${(value / 1000).toFixed(1)} kbps`;
    return `${value} bps`;
}
</script>

<template>
    <section class="flex flex-col gap-3">
        <h2 class="text-sm font-medium">{{ t('endpoint.publicInterfaces') }}</h2>

        <div v-if="!interfaces || interfaces.length === 0" class="text-sm text-neutral-500 italic">
            {{ t('endpoint.noPublicInterfaces') }}
        </div>

        <div v-else class="flex flex-col gap-2">
            <div
                v-for="iface in interfaces"
                :key="iface.uuid"
                class="rounded bg-neutral-100 p-3 text-sm dark:bg-neutral-800"
            >
                <div class="flex flex-col gap-1">
                    <div class="font-medium">
                        {{ iface.properties?.name || iface.uuid }}
                    </div>

                    <div class="font-mono text-xs break-all text-neutral-500">
                        {{ iface.uuid }}
                    </div>
                </div>

                <div
                    v-if="iface.properties"
                    class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-3"
                >
                    <div v-if="iface.properties.interface_type">
                        <span class="text-neutral-500">{{ t('common.type') }}:</span>
                        {{ iface.properties.interface_type }}
                    </div>

                    <div v-if="iface.properties.channel">
                        <span class="text-neutral-500">{{ t('endpoint.channel') }}:</span>
                        {{ iface.properties.channel }}
                    </div>

                    <div v-if="iface.properties.direction">
                        <span class="text-neutral-500">{{ t('endpoint.direction') }}:</span>
                        {{ iface.properties.direction }}
                    </div>

                    <div v-if="iface.properties.round_trip_time !== undefined">
                        <span class="text-neutral-500">RTT:</span>
                        {{ iface.properties.round_trip_time }} ms
                    </div>

                    <div v-if="iface.properties.max_bandwidth !== undefined">
                        <span class="text-neutral-500">{{ t('endpoint.maxBandwidth') }}:</span>
                        {{ formatBandwidth(iface.properties.max_bandwidth) }}
                    </div>
                </div>

                <div
                    v-if="iface.is_waiting_for_socket_connections"
                    class="mt-2 text-xs text-amber-500"
                >
                    {{ t('endpoint.waitingForSockets') }}
                </div>
            </div>
        </div>
    </section>
</template>
