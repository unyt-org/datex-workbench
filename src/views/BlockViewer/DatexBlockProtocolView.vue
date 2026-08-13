<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
import type { Span, FlatResult } from '@/lib/_temp_types.ts';
import BlockProtocolBytes from '@/views/BlockViewer/BlockProtocolBytesView.vue';
import BlockProtocolInfo from '@/views/BlockViewer/BlockProtocolInfoView.vue';
import { parseStructure } from '@unyt/speck';
import { ref, computed } from 'vue';
import { dxbDefinition } from '@/views/BlockViewer/settings';
import DisassemblerView from '@/components/Disassembler/DisassemblerView.vue';
import { Datex } from '@/lib/runtime';

const props = defineProps<{
    blockData: Uint8Array;
}>();

const parsedBlock = parseStructure(dxbDefinition, props.blockData);

const bodySection = parsedBlock.find((s) => s.name === 'Body');
const bodyDXB = bodySection?.fields[0]?.bytes;

// augments parsed body with disassembler data to separate instructions into separate fields
if (bodyDXB) {
  const [instructions] = Datex.disassembleDXBFlat(bodyDXB) as FlatResult;
  bodySection.fields = [];
  for (const {instruction, span} of instructions) {
      const bytes = bodyDXB.slice(span.start, span.end);
      bodySection.fields.push({
          name: "Body",
          bytes,
          parsedValue: typeof instruction == "object" ? instruction[0] : instruction,
      });
  }
}

if (bodySection && !bodySection.fields.some((f) => f.name === 'Body')) {
    bodySection.fields.push({
        name: 'Body',
        bytes: new Uint8Array([]),
    });
}

const selectedField = ref<FieldIdentifier | null>(
    { sectionIndex: 3, fieldIndex: 0 }, // Body
);

function handleBytesSectionFieldClick(data: FieldIdentifier | null) {
    selectedField.value = data;
}
function handleInfoCloseButtonClick() {
    selectedField.value = null;
}
const isBodySelected = computed(() => {
    if (!selectedField.value) return false;
    return parsedBlock[selectedField.value.sectionIndex]?.name === 'Body';
});

const selectedBodySpan = ref<null | Span>(null);

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
            :selectedBodySpan="selectedBodySpan"
            @bytes-section-field-clicked="handleBytesSectionFieldClick"
        />
        <!-- Details view: fills remaining height -->
        <DisassemblerView
            v-if="isBodySelected && bodyDXB"
            class="m-1 flex-1 min-h-0 rounded-lg overflow-hidden bg-card"
            :dxb="bodyDXB"
            v-model="selectedBodySpan"
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
