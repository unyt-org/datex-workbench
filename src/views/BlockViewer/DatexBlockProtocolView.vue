<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/blockProtocolView';
import BlockProtocolBytes from '@/views/BlockViewer/BlockProtocolBytesView.vue';
import BlockProtocolInfo from '@/views/BlockViewer/BlockProtocolInfoView.vue';
import { parseStructure } from '@unyt/speck';
import { ref } from 'vue';
import { dxbDefinition } from '@/views/BlockViewer/settings';

const props = defineProps<{
  blockData: Uint8Array;
}>();

const structureExample = parseStructure(dxbDefinition, props.blockData);

const selectedField = ref<FieldIdentifier>(undefined);

function handleBytesSectionFieldClick(data: FieldIdentifier) {
  selectedField.value = data;
}
function handleInfoCloseButtonClick() {
  selectedField.value = undefined;
}
</script>

<template>
  <div class="h-[calc(100%-15px)]">
    <div class="bg-background m-1 max-h-3/5 overflow-y-auto rounded-lg border px-4">
      <BlockProtocolBytes
        :structure="structureExample"
        :structureDef="dxbDefinition"
        :selectedField="selectedField"
        @bytes-section-field-clicked="handleBytesSectionFieldClick"
      ></BlockProtocolBytes>
    </div>
    <div class="m-1 max-h-2/5 overflow-y-auto rounded-lg border bg-red-600" v-if="selectedField">
      <BlockProtocolInfo
        :structure="structureExample"
        :structureDef="dxbDefinition"
        :selectedField="selectedField"
        @close-button-clicked="handleInfoCloseButtonClick"
      ></BlockProtocolInfo>
    </div>
  </div>
</template>
