import { Datex } from '../runtime';
import { ref, type Ref } from 'vue';
import type { Endpoint } from '../runtime-loader';
import { useTimeoutPoll } from "@vueuse/core";

/**
 * Returns a reactive reference to the set of all endpoints registered in the ComHub.
 */
export function useDiscoveredEndpoints(): Ref<Set<Endpoint>> {
  const endpoints = ref(new Set<Endpoint>());

  useTimeoutPoll(
    () => {
      const metadata = Datex.comHub.getMetadata();
      const newEndpoints = new Set<Endpoint>();
      for (const iface of metadata.interfaces ?? []) {
        for (const socket of iface.sockets ?? []) {
          if (socket.endpoint && socket.endpoint.toString() !== '@@local') {
            newEndpoints.add(socket.endpoint);
          }
        }
      }

      endpoints.value = newEndpoints;
    },
    1000,
    { immediate: true, immediateCallback: true }
  );

  return endpoints;
}
