<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
import type { FieldDefinition, ParsedField } from '@unyt/speck';
import BlockField from './BlockField.vue';
import { bytesCutoff } from '@/views/BlockViewer/settings';

const props = defineProps<{
    field: ParsedField;
    fieldDef: FieldDefinition;
    sectionId: number;
    fieldId: number;
    selectedField: FieldIdentifier | null;
    grayOut: boolean;
}>();

const emit = defineEmits(['field-clicked']);
function handleClick() {
    emit(
        'field-clicked',
        fieldIsSelectedField()
            ? null
            : {
                  sectionIndex: props.sectionId,
                  fieldIndex: props.fieldId,
              },
    );
}

function fieldIsSelectedField() {
    return (
        props.sectionId === props.selectedField?.sectionIndex &&
        props.fieldId === props.selectedField.fieldIndex
    );
}

function cutFieldBytes(field: ParsedField): ParsedField {
    const cutField = structuredClone(field);
    cutField.bytes = cutField.bytes.slice(0, bytesCutoff);
    return cutField;
}

const subfieldsMatchByteLength =
    'subFields' in props.field &&
    props.field.subFields.reduce((acc, subField) => acc + subField.bytes.length, 0) ===
        props.field.bytes.length;
</script>

<template>
    <div @click="handleClick" class="field-wrapper contents cursor-pointer">
        <div v-if="!fieldIsSelectedField()" class="contents">
            <BlockField
                :field="cutFieldBytes(field)"
                :shortenWithDots="field.bytes.length > bytesCutoff"
                :fieldDef="fieldDef"
                :grayOut="grayOut"
            >
            </BlockField>
        </div>
        <div v-else-if="!subfieldsMatchByteLength" class="contents">
            <BlockField
                :field="field"
                :shortenWithDots="false"
                :fieldDef="fieldDef"
                :grayOut="grayOut"
            ></BlockField>
        </div>
        <div v-else class="subfield-wrapper contents">
            <BlockField
                v-for="(subField, index) in 'subFields' in field ? field.subFields : []"
                :key="index"
                :field="subField"
                :shortenWithDots="false"
                :fieldDef="fieldDef"
                :grayOut="grayOut"
            ></BlockField>
        </div>
    </div>
</template>
