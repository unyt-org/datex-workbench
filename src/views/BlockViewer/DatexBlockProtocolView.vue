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

const parsedBlock = parseStructure(dxbDefinition, props.blockData);

const bodySection = parsedBlock.find((s) => s.name === 'Body');
if (bodySection && !bodySection.fields.some((f) => f.name === 'Body')) {
    bodySection.fields.push({
        name: 'Body',
        bytes: new Uint8Array([]),
    });
}
const bodyDXB = bodySection?.fields[0]!.bytes;


const bodySectionDef = dxbDefinition.sections.find((s) => s.name === 'Body');
if (bodySectionDef && !bodySectionDef.fields.some((f) => f.name === 'Body')) {
    bodySectionDef.fields.push({
        name: 'Body',
        byteSize: 3,
    });
}

const selectedField = ref<FieldIdentifier | null>(
  {sectionIndex: 3, fieldIndex: 0} // Body
);

function handleBytesSectionFieldClick(data: FieldIdentifier | null) {
  console.log("handleBytesSectionFieldClick", data)
    selectedField.value = data;
}
function handleInfoCloseButtonClick() {
    selectedField.value = null;
}
const isBodySelected = computed(() => {
    if (!selectedField.value) return false;
    return parsedBlock[selectedField.value.sectionIndex]?.name === 'Body';
});
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- Block sections: auto-size, max 50% height, scrolls if needed -->
        <BlockProtocolBytes
            class="m-1 rounded-lg overflow-y-auto"
            style="max-height: 40%; flex-shrink: 0"
            :structure="parsedBlock"
            :structureDef="dxbDefinition"
            :selectedField="selectedField"
            @bytes-section-field-clicked="handleBytesSectionFieldClick"
        />
        <!-- Details view: fills remaining height -->
        <DisassemblerView
            v-if="isBodySelected && bodyDXB"
            class="m-1 flex-1 min-h-0 rounded-lg overflow-hidden bg-card"
            :dxb="bodyDXB"
        />
        <BlockProtocolInfo
            v-else-if="selectedField"
            class="m-1 flex-1 min-h-0 rounded-lg overflow-y-auto"
            :structure="parsedBlock"
            :structureDef="dxbDefinition"
            :selectedField="selectedField"
            @close-button-clicked="handleInfoCloseButtonClick"
        />
    </div>
</template>
