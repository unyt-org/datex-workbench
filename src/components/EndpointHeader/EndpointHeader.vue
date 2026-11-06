<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, ChevronsLeftRightEllipsisIcon } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
} from '@/components/ui/combobox'
import { refDebounced } from "@vueuse/core";

import { connectedInspectorInstances, availableInspectorEndpoints, connectInspector, activeEndpoint, setActiveEndpoint } from '../../lib/inspector/mod.ts';
import EndpointLabel from './EndpointLabel.vue';
import { Endpoint } from '../../lib/runtime-loader.ts';
console.log(connectedInspectorInstances);

const groupedEndpoints = computed(() => [
  {
    label: 'Active Sessions',
    endpoints: Array.from(connectedInspectorInstances).map(([endpoint]) => ({ endpoint })),
  },
  {
    label: 'Other Endpoints',
    endpoints: Array.from(availableInspectorEndpoints.keys()).map(endpoint => ({ endpoint })),
  },
])

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

globalThis.activeEndpoint = activeEndpoint;

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


</script>

<template>
  <div class="bg-muted top-3 right-3 absolute z-10 rounded-sm">
    <Combobox v-model="selectedEndpoint" by="endpoint">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button
          variant="outline"
          class="h-9  justify-between px-2.5"
        >
          <template v-if="selectedEndpoint">
            <EndpointLabel :endpoint="selectedEndpoint.endpoint" />
          </template>
          <template v-else>
            Select endpoint
          </template>
          <ChevronDownIcon class="text-muted-foreground" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList class="w-72" align="start">
      <ComboboxInput v-model="search" placeholder="Search endpoints..." />
      <ComboboxViewport class="max-h-[260px]">
        <ComboboxEmpty>
          <div v-if="searchEndpoint">
            <Button
              variant="outline"
              @click="connectInspector(searchEndpoint)"
            >
              <div class="flex items-center gap-2">
                <ChevronsLeftRightEllipsisIcon />
                Connect to <EndpointLabel :endpoint="searchEndpoint" />
              </div>
            </Button>
          </div>
          <div v-else>
            No matching endpoint found
          </div>
        </ComboboxEmpty>
        <template v-for="endpointGroup in groupedEndpoints">
          <ComboboxGroup
            v-if="endpointGroup.endpoints.length > 0"
            :key="endpointGroup.label"
            :heading="endpointGroup.label"
          >
            <ComboboxItem
              v-for="endpoint in endpointGroup.endpoints"
              :key="endpoint.endpoint.toString()"
              :value="endpoint"
            >
              <EndpointLabel :endpoint="endpoint.endpoint" />
              <ComboboxItemIndicator>
                <CheckIcon />
              </ComboboxItemIndicator>
            </ComboboxItem>
          </ComboboxGroup>
        </template>
      </ComboboxViewport>
      <ComboboxSeparator />
      <ComboboxGroup class="bg-popover">
        <ComboboxItem :value="null">
          <ChevronsLeftRightEllipsisIcon />
          Connect endpoint
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
  </div>
</template>
