<script setup lang="ts">
import { CheckIcon, ChevronDownIcon, Loader2 } from 'lucide-vue-next'
import { useEndpointSearch } from '@/lib/composables/use-endpoint-search'
import { Button } from '@/components/ui/button'
import {
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxSeparator,
  ComboboxViewport,
} from '@/components/ui/combobox'
import { Combobox, ComboboxTrigger, ComboboxAnchor } from '@/components/ui/combobox'
import EndpointLabel from './EndpointLabel.vue'
import { useEndpointConnectionStatus } from '@/lib/composables/use-endpoint-connection-status.ts'

defineProps<{
  fullWidth?: boolean
}>();

const { groupedEndpoints, selectedEndpoint, search, searchEndpoint } = useEndpointSearch()

// triggers ping requests for currently searching endpoint so that it appears in the list when reachable
useEndpointConnectionStatus(() => searchEndpoint?.value);


</script>
<template>
  <Combobox v-model="selectedEndpoint" by="endpoint" :class="fullWidth ? 'w-full!' : ''">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button
          variant="outline"
          class="h-9 w-full! max-w-none justify-between px-2.5"
          :class="fullWidth ? 'w-full!' : ''"
        >
          <template v-if="selectedEndpoint">
            <div class="flex items-center gap-3">
              <EndpointLabel :endpoint="selectedEndpoint.endpoint" />
            </div>
          </template>
          <template v-else>
            Select endpoint
          </template>
          <ChevronDownIcon class="text-muted-foreground" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList class="w-(--reka-combobox-trigger-width) min-w-[300px]" align="end">
      <ComboboxInput v-model="search" placeholder="Find endpoints..." />
      <ComboboxViewport class="max-h-[260px]">
        <ComboboxEmpty>
          <!--<div v-if="searchEndpoint">
            <Button
              variant="outline"
              @click="connectInspector(searchEndpoint)"
              :disabled="searchEndpointIsConnected === false"
            >
              <div class="flex items-center gap-2">
                <ChevronsLeftRightEllipsisIcon />
                Connect to <EndpointLabel :endpoint="searchEndpoint" />
              </div>
            </Button>
          </div>-->
          <div class="text-muted-foreground flex items-center gap-2 justify-center">
            Searching for endpoints
            <Loader2 class="h-4 w-4 animate-spin" />
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
      <!--<ComboboxGroup class="bg-popover">
        <ComboboxItem :value="null" @select="openConnectDialog">
          <ChevronsLeftRightEllipsisIcon />
          Connect new endpoint
        </ComboboxItem>
      </ComboboxGroup>-->
    </ComboboxList>
  </Combobox>
</template>
