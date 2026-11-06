import { ref, toValue, onScopeDispose, type MaybeRefOrGetter, type Ref, effectScope, type EffectScope, shallowRef, watch } from "vue";
import { Endpoint } from "../runtime-loader";
import { Datex } from "../runtime";
import { useTimeoutPoll } from "@vueuse/core";
import { computed } from "vue";
import { connectedInspectorInstances } from "../inspector/mod";

type EndpointConnectionStatusHandler = {
  isConnected: Ref<boolean>,
  pollCount: Ref<number>,
  disconnectionCount: Ref<number>,
  rc: number,
  scope: EffectScope
}

const endpointConnectionStatusHandlers = new Map<Endpoint, EndpointConnectionStatusHandler>();
const POLL_INTERVAL_MS = 5000;

export function acquireStatusHandler(
  endpoint: Endpoint,
): EndpointConnectionStatusHandler {
  // for endpoint @@local, don't poll, always consider it connected
  if (endpoint === Endpoint.get("@@local")) {
    return {
      isConnected: ref(true),
      pollCount: ref(0),
      disconnectionCount: ref(0),
      rc: 1,
      scope: effectScope(true)
    };
  }

  let handler = endpointConnectionStatusHandlers.get(endpoint);

  if (!handler) {
    const isConnected = ref(false);
    const pollCount = ref(0);
    const connectionLostCount = ref(0);
    const scope = effectScope(true);

    scope.run(() => {
      useTimeoutPoll(async () => {
        const wasConnected = isConnected.value;
        try {
          isConnected.value = !!(await Datex.comHub.getTrace(endpoint.toString()));
        } catch {
          isConnected.value = false;
        }
        pollCount.value++;
        // increment disconnection count once if we just lost connection
        if (!isConnected.value && wasConnected) {
          connectionLostCount.value++;
        }

      }, POLL_INTERVAL_MS, { immediate: true, immediateCallback: true });
    });

    handler = { isConnected, pollCount, disconnectionCount: connectionLostCount, rc: 0, scope };
    endpointConnectionStatusHandlers.set(endpoint, handler);
  }

  handler.rc++;

  return handler;
}

function releaseStatusHandler(endpoint: Endpoint) {
  const handler = endpointConnectionStatusHandlers.get(endpoint);
  if (!handler) return;

  if (--handler.rc === 0) {
    handler.scope.stop();
    endpointConnectionStatusHandlers.delete(endpoint);
  }
}

/**
 * Composable to get the connection status of an endpoint.
 * Returns a reactive boolean indicating whether the endpoint is connected.
 * @param endpoint
 * @returns An object containing reactive references for the connection status, poll count, and connection lost count of the endpoint.
 */
export function useEndpointConnectionStatus(
  endpoint: MaybeRefOrGetter<Endpoint>,
): { isConnected: Ref<boolean>, pollCount: Ref<number>, connectionLostCount: Ref<number> } {
const current = shallowRef<EndpointConnectionStatusHandler>();
  let held: Endpoint | undefined;

  watch(
    () => toValue(endpoint).toString(),
    () => {
      const next = toValue(endpoint);
      if (held) releaseStatusHandler(held);
      held = next;
      current.value = acquireStatusHandler(next);
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    if (held) releaseStatusHandler(held);
  });

  return {
    isConnected: computed(() => current.value?.isConnected.value ?? false),
    pollCount: computed(() => current.value?.pollCount.value ?? 0),
    connectionLostCount: computed(() => current.value?.disconnectionCount.value ?? 0),
  };
}
