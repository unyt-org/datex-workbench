<script setup lang="ts">
import { Datex } from '@/lib/runtime.ts';
import EndpointLabel from '../Endpoints/EndpointLabel.vue';
import type { ComHubMetadataInterface, ComHubMetadataInterfaceSocket, InterfaceDirection } from '@/lib/_temp_types.ts';
import { ref } from 'vue';
import type { Endpoint } from '@/lib/runtime-loader.ts';
import { Loader2, UnplugIcon } from 'lucide-vue-next';
import Card from '@/components/ui/card/Card.vue';
import CardContent from '../ui/card/CardContent.vue';

defineProps<{
    iface: ComHubMetadataInterface;
    advancedMode: boolean;
    reconnecting?: boolean;
}>();

const expanded = ref<boolean>(false);


async function disconnectSocket(interfaceUuid: string, socketUuid: string, endpoint: Endpoint) {
    await Datex.comHub.removeSocket(socketUuid as `socket::${string}`);
    console.warn('[ComHub] disconnectSocket called', { interfaceUuid, socketUuid, endpoint });
}

async function disconnectInterface(interfaceUuid: string) {
    await Datex.comHub.removeInterface(interfaceUuid as `com_interface::${string}`);
}

function toggleExpand() {
    expanded.value = !expanded.value;
}

function getSortedSockets(sockets: ComHubMetadataInterfaceSocket[]) {
    return [...sockets].sort((a, b) => {
        if (a.properties?.is_direct !== b.properties?.is_direct)
            return a.properties?.is_direct ? -1 : 1;
        return Number(a.properties?.known_since) - Number(b.properties?.known_since);
    });
}

function getDirectionArrow(direction: InterfaceDirection): string {
    if (direction.tag === 'InOut') return '↔';
    if (direction.tag === 'In') return '←';
    if (direction.tag === 'Out') return '→';
    return '';
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
<template>
  <!-- Interface Header -->
  <Card class="py-0" :class="reconnecting && 'opacity-70'">
      <CardContent class="p-4">
        <div class="flex-1" :class="!reconnecting && 'cursor-pointer'" @click="!reconnecting && toggleExpand()">
            <div class="flex gap-4 items-center justify-between">
              <h3 class="text-primary font-semibold">
                  <span v-if="!reconnecting" class="border-2 border-green-500 rounded-full w-3 h-3 inline-block mr-1"></span>
                  <Loader2 v-else class="inline-block h-3.5 w-3.5 -translate-y-0.5 animate-spin" />
                  {{ iface.properties?.interface_type || 'Unknown interface' }}
                  <span class="text-muted-foreground ml-1 font-normal" v-if="iface.properties && iface.properties.name"
                      >{{ iface.properties.name }}</span
                  >
              </h3>
              <div class="flex gap-3 items-center">
                <span class="text-faint text-sm">Estimated RTT: {{ iface.properties?.round_trip_time ?? 'N/A' }} ms</span>

                <button
                    v-if="advancedMode"
                    @click.stop="disconnectInterface(iface.uuid)"
                    class="btn-danger w-24 flex items-center gap-1"
                >
                    <UnplugIcon class="h-5 w-5" />
                    Disconnect
                </button>

              </div>

            </div>
            <div class="text-dim mt-1 text-sm">
                Sockets: {{ iface.sockets.length }} • Channel:
                {{ iface.properties?.channel ?? 'unknown' }}
            </div>
        </div>

        <!-- Expanded Socket List -->
        <div v-if="expanded && !reconnecting" class="mt-3 flex flex-wrap gap-3 border-t pt-3">
            <div
                v-for="socket in getSortedSockets(iface.sockets)"
                :key="socket.uuid + socket.endpoint"
                class="card-inner max-lg:w-full"
            >
                <div class="flex items-center justify-between gap-6">
                    <div class="flex flex-1 flex-col gap-1">
                        <h4 class="flex items-center gap-2 font-semibold">
                            <EndpointLabel :endpoint="socket.endpoint" />
                            <span
                                v-if="socket.properties && socket.properties.is_direct"
                                class="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300"
                                >direct</span
                            >
                            <span class="text-neutral-400">{{
                                getDirectionArrow(socket.direction)
                            }}</span>
                        </h4>
                    </div>
                    <button
                        v-if="advancedMode"
                        @click.stop="disconnectSocket(iface.uuid, socket.uuid, socket.endpoint)"
                        class="btn-danger w-24 flex items-center gap-1"
                    >
                        <UnplugIcon class="h-5 w-5" />
                        Disconnect
                    </button>
                </div>

                <div class="text-dim mt-1 text-xs">
                  Distance: {{ socket.properties?.distance ?? 'N/A' }} • Created:
                  {{
                      socket.properties?.known_since
                          ? formatTime(Number(socket.properties.known_since))
                          : 'unknown'
                  }}
                </div>
            </div>
            <div v-if="getSortedSockets(iface.sockets).length === 0" class="text-dim text-sm">
                No sockets connected
            </div>
        </div>

      </CardContent>
  </Card>
</template>
