<template>
    <div>
        <div
            v-for="iface in filteredInterfaces"
            :key="iface.uuid"
            class="card cursor-pointer"
        >
          <InterfaceCard :iface="iface" :advancedMode="props.advancedMode" />
        </div>

        <div
            v-for="iface in filteredReconnectingInterfaces"
            :key="iface.uuid"
            class="card cursor-pointer"
        >
          <InterfaceCard :iface="iface" :advancedMode="props.advancedMode" reconnecting />
        </div>

        <div v-if="filteredInterfaces.length === 0" class="text-dim text-sm">
            No matching endpoints found.
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';
import type { ComHubMetadataInterface, ComHubMetadata } from '@/lib/_temp_types.ts';
import InterfaceCard from './ComHub/InterfaceCard.vue';

const props = defineProps<{
    comHubMetadata: ComHubMetadata | null;
    searchQuery: string;
    advancedMode: boolean;
}>();

function filterInterfaces(interfaces: ComHubMetadataInterface[]) {
  const query = props.searchQuery.trim().toLowerCase();

  if (!query) return interfaces;

  return interfaces
        .map((iface) => {
            const matchingSockets = iface.sockets.filter((socket) =>
                socket.endpoint?.toString().toLowerCase().includes(query),
            );
            if (matchingSockets.length === 0) return null;
            return markRaw({ ...iface, sockets: matchingSockets });
        })
        .filter((iface): iface is ComHubMetadataInterface => iface !== null);
}

const filteredInterfaces = computed(() => {
    return filterInterfaces(props.comHubMetadata?.interfaces ?? []);
});

const filteredReconnectingInterfaces = computed(() => {
    return filterInterfaces(props.comHubMetadata?.reconnecting_interfaces ?? []);
});

// watch(filteredInterfaces, (ifaces) => {
//     if (!props.searchQuery.trim()) return;
//     for (const iface of ifaces) {
//         expanded[iface.uuid] = true;
//     }
// });

// watch(
//     () => props.searchQuery,
//     (val) => {
//         if (!val.trim()) {
//             Object.keys(expanded).forEach((key) => {
//                 expanded[key] = false;
//             });
//         }
//     },
// );
</script>
