<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
import BlockProtocolBytes from '@/views/BlockViewer/BlockProtocolBytesView.vue';
import BlockProtocolInfo from '@/views/BlockViewer/BlockProtocolInfoView.vue';
import { parseStructure } from '@unyt/speck';
import { ref, computed } from 'vue';
import { dxbDefinition } from '@/views/BlockViewer/settings';
import DisassemblerView from '@/components/Disassembler/DisassemblerView.vue';

const props = defineProps<{
    blockData: Uint8Array;
}>();

const structureExample = parseStructure(dxbDefinition, props.blockData);
const emptyDxb = new Uint8Array()

const bodySection = structureExample.find(s => s.name === 'Body')
if (bodySection && !bodySection.fields.some(f => f.name === 'Body')) {
  bodySection.fields.push({
  name: 'Body',
  bytes: new Uint8Array([0, 0, 0])
  })
}

const bodySectionDef = dxbDefinition.sections.find(s => s.name === 'Body')
if (bodySectionDef && !bodySectionDef.fields.some(f => f.name === 'Body')) {
  bodySectionDef.fields.push({
    name: 'Body',
    byteSize: 3
  })
}

const selectedField = ref<FieldIdentifier | null>(null);

function handleBytesSectionFieldClick(data: FieldIdentifier | null) {
    selectedField.value = data;
}
function handleInfoCloseButtonClick() {
    selectedField.value = null;
}
const isBodySelected = computed(() => {
  if (!selectedField.value) return false
  return structureExample[selectedField.value.sectionIndex]?.name === 'Body'
})

</script>

<template>
  <div class="flex flex-col h-full">
      <!-- Block sections: auto-size, max 50% height, scrolls if needed -->
      <BlockProtocolBytes
          class="m-1 rounded-lg overflow-y-auto"
          style="max-height: 40%; flex-shrink: 0"
          :structure="structureExample"
          :structureDef="dxbDefinition"
          :selectedField="selectedField"
          @bytes-section-field-clicked="handleBytesSectionFieldClick"
      />
      <!-- Details view: fills remaining height -->
      <DisassemblerView
          v-if="isBodySelected"
          class="m-1 flex-1 min-h-0 rounded-lg overflow-hidden bg-muted"
          :dxb="emptyDxb"
      />
      <BlockProtocolInfo
          v-else-if="selectedField"
          class="m-1 flex-1 min-h-0 rounded-lg overflow-y-auto"
          :structure="structureExample"
          :structureDef="dxbDefinition"
          :selectedField="selectedField"
          @close-button-clicked="handleInfoCloseButtonClick"
      />
  </div>
</template>
