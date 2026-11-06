<script setup lang="ts">
import { CheckIcon, ChevronsLeftRightEllipsisIcon, ChevronDownIcon } from 'lucide-vue-next'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Combobox, ComboboxTrigger, ComboboxAnchor } from '@/components/ui/combobox'
import { connectInspector } from '@/lib/inspector/mod';
import EndpointLabel from './EndpointLabel.vue'
import { ref, nextTick } from 'vue'

defineProps<{
  fullWidth?: boolean
}>();

const { groupedEndpoints, selectedEndpoint, search, searchEndpoint } = useEndpointSearch()


const comboboxOpen = ref(false);
const dialogOpen = ref(false);
const newEndpoint = ref("");

function openConnectDialog(event: Event) {
  event.preventDefault(); // don't select the item / set the model to null
  newEndpoint.value = search.value; // prefill with what was typed
  comboboxOpen.value = false;
  nextTick(() => {
    dialogOpen.value = true;
  });
}

function submitNewEndpoint() {
  connectInspector(newEndpoint.value);
  dialogOpen.value = false;
}

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
              <div class="text-muted-foreground">
                Example
              </div>
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
        <ComboboxItem :value="null" @select="openConnectDialog">
          <ChevronsLeftRightEllipsisIcon />
          Connect new endpoint
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>

  <Dialog v-model:open="dialogOpen">
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Connect new endpoint</DialogTitle>
      <DialogDescription>
        Enter the endpoint you want to connect to.
      </DialogDescription>
    </DialogHeader>
    <form class="grid gap-4" @submit.prevent="submitNewEndpoint">
      <Input v-model="newEndpoint" placeholder="@example" />
      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled>Connect</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
</template>
