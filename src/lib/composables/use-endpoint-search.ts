
import { connectedInspectorInstances, availableInspectorEndpoints, activeEndpoint, setActiveEndpoint } from '../../lib/inspector/mod.ts';
import { Endpoint } from '../../lib/runtime-loader.ts';
import { watch, ref, computed, type ComputedRef, type Ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useDiscoveredEndpoints } from './use-discovered-endpoints.ts';

export function useEndpointSearch(): {
  groupedEndpoints: ComputedRef<{ label: string; endpoints: { endpoint: string }[] }[]>,
  selectedEndpoint: Ref<{endpoint: Endpoint}>,
  search: Ref<string>,
  searchEndpoint: ComputedRef<Endpoint | null>,
} {

  const groupedEndpoints = computed(() => {
    const endpoints = [
      {
        label: 'Active Inspector Sessions',
        endpoints: Array.from(connectedInspectorInstances).map(([endpoint]) => ({ endpoint })),
      },
      {
        label: 'Recent Endpoints',
        endpoints: Array.from(availableInspectorEndpoints.keys()).map(endpoint => ({ endpoint })),
      }
    ];

    const discoveredEndpoints = Array.from(useDiscoveredEndpoints().value).map(endpoint => ({ endpoint }));
    // remove any discovered endpoints that are already listed in active or recent endpoints
    const existingEndpoints = new Set(endpoints.flatMap(group => group.endpoints.map(e => e.endpoint)));
    const filteredDiscoveredEndpoints = discoveredEndpoints.filter(e => !existingEndpoints.has(e.endpoint));
    endpoints.push({
      label: 'Discovered Endpoints',
      endpoints: filteredDiscoveredEndpoints,
    });

    return endpoints;
  });

  const selectedEndpoint = ref({ endpoint: activeEndpoint.value });

  watch(selectedEndpoint, (newVal) => {
    if (newVal?.endpoint) {
      setActiveEndpoint(newVal.endpoint).then(success => {
        if (!success) {
          console.error("Failed to set active endpoint", newVal.endpoint);
        }
      });
    }
  });

  const search = ref('');
  const debouncedSearch = refDebounced(search, 300);

  const searchEndpoint = computed(() => {
    if (!debouncedSearch.value || debouncedSearch.value.length < 3) {
      return null;
    }
    if (debouncedSearch.value.startsWith('@')) {
      return Endpoint.get(debouncedSearch.value);
    }
    return Endpoint.get("@" + debouncedSearch.value);
  })


  return {
    groupedEndpoints,
    selectedEndpoint,
    search,
    searchEndpoint,
  }
}
