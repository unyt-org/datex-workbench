<script setup lang="ts">
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

const selectedField = ref<{ sectionName: string; fieldName: string } | undefined>(undefined);
const handleBytesSectionFieldClick = (data: { sectionName: string; fieldName: string } | undefined) => {
  selectedField.value = structuredClone(data);
  console.log(selectedField?.value?.fieldName + ' in ' + selectedField?.value?.sectionName);
};
</script>

<template>
  <div class="h-[calc(100%-15px)]">
    <div class="bg-background m-1 max-h-3/5 overflow-y-auto rounded-lg border px-4">
      <BlockProtocolBytes
        :structure="structureExample"
        :structureDef="jsonDataExample"
        @bytes-section-field-clicked="handleBytesSectionFieldClick"
      ></BlockProtocolBytes>
    </div>
    <div class="bg-background m-1 max-h-3/5 overflow-y-auto rounded-lg border px-4">
      <BlockProtocolInfo
        v-if="selectedField"
        :field="selectedField"
        :structure="structureExample"
        :structureDef="jsonDataExample"
      ></BlockProtocolInfo>
    </div>
  </div>
</template>
