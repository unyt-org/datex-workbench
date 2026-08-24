<template>
    <div>
        <div
            v-for="[endpointId, sockets] in filteredEndpoints"
            :key="endpointId"
            class="card cursor-pointer transition hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
        >
            <!-- Endpoint Header -->
            <div
                class="flex cursor-pointer items-center justify-between"
                @click="toggle(endpointId)"
            >
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <h3
                            class="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400"
                        >
                            {{ endpointId }}
                        </h3>
                        <span
                            v-if="isDirect(sockets)"
                            class="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300"
                            >direct</span
                        >
                    </div>
                    <div class="text-dim text-xs">
                        Connected via {{ sockets.length }}
                        {{ sockets.length === 1 ? 'socket' : 'sockets' }}
                        {{ getEndpointDirection(sockets) }}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-neutral-400">{{
                        expanded[endpointId] ? '▾' : '▸'
                    }}</span>
                </div>
            </div>

            <!-- Expanded Socket List -->
            <div v-if="expanded[endpointId]" class="mt-3 flex flex-col gap-2 border-t pt-3">
                <div v-for="(socket, idx) in sockets" :key="socket.uuid + idx" class="card-inner">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex flex-1 flex-col gap-1">
                            <h4 class="text-sm font-semibold">
                                {{ socket.interface.properties.interface_type }}
                                <span
                                    v-if="socket.interface.properties.name"
                                    class="font-normal text-neutral-500"
                                >
                                    ({{ socket.interface.properties.name }})
                                </span>
                            </h4>
                            <div class="text-faint mt-0.5 font-mono text-xs">{{ socket.uuid }}</div>
                            <div class="dim mt-1 flex items-center gap-2 text-xs">
                                <span
                                    >Known since
                                    {{ formatTime(Number(socket.properties.known_since)) }}</span
                                >
                                <span>·</span>
                                <span>Distance: {{ socket.properties.distance }}</span>
                                <span
                                    v-if="socket.properties.is_direct"
                                    class="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300"
                                    >direct</span
                                >
                            </div>
                        </div>
                        <button
                            v-if="advancedMode"
                            @click.stop="removeSocket(socket.uuid)"
                            class="btn-danger w-24 text-center"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="filteredEndpoints.length === 0" class="text-dim text-sm">
            No matching endpoints found.
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ComHubInterface, ComHubSocket } from '@/components/ComHubOverviewWrapper.vue';
import { removeSocket } from '@/lib/runtime';
import { computed, reactive, watch } from 'vue';

interface SocketWithInterface extends ComHubSocket {
    interface: {
        uuid: string;
        properties: ComHubInterface['properties'];
    };
}

const props = defineProps<{
    interfaces: ComHubInterface[];
    searchQuery: string;
    advancedMode: boolean;
}>();

const expanded = reactive<Record<string, boolean>>({});

const endpointMap = computed((): Map<string, SocketWithInterface[]> => {
    const map = new Map<string, SocketWithInterface[]>();
    for (const iface of props.interfaces) {
        for (const socket of iface.sockets) {
            const entry: SocketWithInterface = {
                ...socket,
                interface: { uuid: iface.uuid, properties: iface.properties },
            };
            if (!map.has(socket.endpoint)) map.set(socket.endpoint, []);
            map.get(socket.endpoint)!.push(entry);
        }
    }
    return map;
});

const filteredEndpoints = computed((): [string, SocketWithInterface[]][] => {
    const query = props.searchQuery.trim().toLowerCase();
    const entries = Array.from(endpointMap.value.entries());
    if (!query) return entries;
    return entries.filter(([endpointId]) => endpointId.toLowerCase().includes(query));
});

watch(filteredEndpoints, (entries) => {
    if (!props.searchQuery.trim()) return;
    for (const [endpointId] of entries) {
        expanded[endpointId] = true;
    }
});

watch(
    () => props.searchQuery,
    (val) => {
        if (!val.trim()) {
            Object.keys(expanded).forEach((key) => {
                expanded[key] = false;
            });
        }
    },
);

function toggle(endpointId: string) {
    expanded[endpointId] = !expanded[endpointId];
}

function getEndpointDirection(sockets: SocketWithInterface[]): string {
    const dirs = new Set(sockets.map((s) => s.direction));
    if (dirs.has('InOut')) return '↔';
    if (dirs.has('In') && dirs.has('Out')) return '↔';
    if (dirs.has('In')) return '←';
    if (dirs.has('Out')) return '→';
    return '↔';
}

function isDirect(sockets: SocketWithInterface[]): boolean {
    return sockets.some((s) => s.properties.is_direct);
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

function formatTime(ms: number): string {
    const elapsed = Math.floor((Date.now() - ms) / 1000);
    if (elapsed < 60) return rtf.format(-elapsed, 'second');
    const minutes = Math.floor(elapsed / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    return rtf.format(-Math.floor(hours / 24), 'day');
}
</script>
