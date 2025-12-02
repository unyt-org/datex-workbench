<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/blockProtocolView';
import BlockProtocolBytes from '@/views/BlockViewer/BlockProtocolBytesView.vue';
import BlockProtocolInfo from '@/views/BlockViewer/BlockProtocolInfoView.vue';
import { parseStructure, type StructureDefinition } from '@unyt/speck';
import { ref } from 'vue';

// this will later not be fetched from the example data
const jsonDataExample: StructureDefinition = await (
  await fetch(
    'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
  )
).json();
const blockDataExample: Uint8Array = new Uint8Array(
  await (
    await fetch(
      'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin',
    )
  ).arrayBuffer(),
);
const structureExample = parseStructure(jsonDataExample, blockDataExample);

const selectedField = ref<FieldIdentifier | undefined>(undefined);
const handleBytesSectionFieldClick = (data: FieldIdentifier | undefined) => {
  selectedField.value = data;
};

const handleInfoCloseButtonClick = () => {
  selectedField.value = undefined;
};
</script>

<template>
  <div class="h-[calc(100%-15px)]">
    <div class="bg-background m-1 max-h-3/5 overflow-y-auto rounded-lg border px-4">
      <BlockProtocolBytes
        :structure="structureExample"
        :structureDef="jsonDataExample"
        :selectedField="selectedField"
        @bytes-section-field-clicked="handleBytesSectionFieldClick"
      ></BlockProtocolBytes>
    </div>
    <div class="bg-background m-1 max-h-2/5 overflow-y-auto rounded-lg border" v-if="selectedField">
      <BlockProtocolInfo
        :structure="structureExample"
        :structureDef="jsonDataExample"
        :selectedField="selectedField"
        @close-button-clicked="handleInfoCloseButtonClick"
      ></BlockProtocolInfo>
    </div>
  </div>
</template>

<!-- DONE don't seperate subfields when the field is not expanded -->
<!-- DONE when expanded, each subfield should have an additional exta hover effect -->
<!-- DONE when hovering field in one section, also grey out all fields in the other sections -->
<!-- DONE use lucide icons to replace x button -->
<!-- PENDING also change theme switcher to lucide -->
<!-- PENDING generally clean up the Info Box even more -->
<!-- PENDING clean up the correct display of the id -->
<!-- PENDING incooperate category color in some way-->
<!-- PENDING Do correct line break in the info view table for things like Key, subField of Recievers with key -->
<!-- PENDING add tooltip when hovering over a byte containing the name of the field and the
  absolut byte offset of the whole block and where the field starts and ends as byte offset -->
