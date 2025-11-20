<script setup lang="ts">
import type { FieldIdentifier } from '@/types/block-protocol-view';
import BlockProtocolBytes from '@/views/BlockProtocolBytesView.vue';
import BlockProtocolInfo from '@/views/BlockProtocolInfoView.vue';
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
console.log(jsonDataExample)

const selectedField = ref<FieldIdentifier | undefined>(undefined);
const handleBytesSectionFieldClick = (
  data: FieldIdentifier | undefined,
) => {
  selectedField.value = data;
};

const handleInfoCloseButtionClick = () => {
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
    <div
      class="bg-background m-1 max-h-2/5 overflow-y-auto rounded-lg border px-4"
      v-if="selectedField"
    >
      <BlockProtocolInfo
        :structure="structureExample"
        :structureDef="jsonDataExample"
        :selectedField="selectedField"
        @close-button-clicked="handleInfoCloseButtionClick"
      ></BlockProtocolInfo>
    </div>
  </div>
</template>
