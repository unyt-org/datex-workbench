<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
import BlockProtocolBytes from '@/views/BlockViewer/BlockProtocolBytesView.vue';
import BlockProtocolInfo from '@/views/BlockViewer/BlockProtocolInfoView.vue';
import { parseStructure } from '@unyt/speck';
import { ref } from 'vue';
import { dxbDefinition } from '@/views/BlockViewer/settings';

const props = defineProps<{
    blockData: Uint8Array;
}>();

const structureExample = parseStructure(dxbDefinition, props.blockData);

const selectedField = ref<FieldIdentifier | null>(null);

function handleBytesSectionFieldClick(data: FieldIdentifier | null) {
    selectedField.value = data;
}
function handleInfoCloseButtonClick() {
    selectedField.value = null;
}
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
        <BlockProtocolInfo
            v-if="selectedField"
            class="m-1 max-h-2/5 rounded-lg border"
            :structure="structureExample"
            :structureDef="dxbDefinition"
            :selectedField="selectedField"
            @close-button-clicked="handleInfoCloseButtonClick"
        ></BlockProtocolInfo>
    </div>
</template>
