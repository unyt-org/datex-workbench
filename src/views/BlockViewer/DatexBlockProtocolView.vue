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
console.log('body section def:', JSON.stringify(dxbDefinition.sections.find(s => s.name === 'Body')))

const bodySection = structureExample.find(s => s.name === 'Body')
if (bodySection) {
  bodySection.fields.push({
  name: 'Body',
  bytes: new Uint8Array([0, 0, 0])
  })
}

const bodySectionDef = dxbDefinition.sections.find(s => s.name === 'Body')
if (bodySectionDef) {
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
    <div class="h-[calc(100%-15px)]">
        <BlockProtocolBytes
            class="m-1 max-h-3/5 rounded-lg border"
            :structure="structureExample"
            :structureDef="dxbDefinition"
            :selectedField="selectedField"
            @bytes-section-field-clicked="handleBytesSectionFieldClick"
        ></BlockProtocolBytes>

        <DisassemblerView
            v-if="isBodySelected"
            class="m-1 max-h-2/3 rounded-lg border overflow-y-auto"
            :dxb="emptyDxb"
></DisassemblerView>
        <BlockProtocolInfo
            v-else-if="selectedField"
            class="m-1 max-h-2/5 rounded-lg border"
            :structure="structureExample"
            :structureDef="dxbDefinition"
            :selectedField="selectedField"
            @close-button-clicked="handleInfoCloseButtonClick"
        ></BlockProtocolInfo>
    </div>
</template>
