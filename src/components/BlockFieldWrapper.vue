<script setup lang="ts">
import type { FieldIdentifier } from '@/types/block-protocol-view';
import type { FieldDefinition, ParsedField } from '@unyt/speck';
import BlockField from './BlockField.vue';

const props = defineProps<{
  field: ParsedField;
  fieldDef: FieldDefinition | undefined;
  sectionId: number;
  fieldId: number;
  selectedField: FieldIdentifier | undefined;
}>();

const emit = defineEmits(['field-clicked']);
const handleClick = () => {
  // console.log(props.field);
  // console.log(props.fieldDef);
  emit(
    'field-clicked',
    fieldIsSelectedField()
      ? undefined
      : {
          sectionIndex: props.sectionId,
          fieldIndex: props.fieldId,
        },
  );
};

const fieldIsSelectedField = () =>
  props.sectionId == props.selectedField?.sectionIndex &&
  props.fieldId == props.selectedField.fieldIndex;

const bytesCutoff: number = 25;
const cutFieldBytes = (field: ParsedField): ParsedField => {
  const cutField = structuredClone(field);
  cutField.bytes = cutField.bytes.slice(0, bytesCutoff);
  return cutField;
};

const displaySubfields = (): boolean =>
  'subFields' in props.field &&
  props.field.subFields.reduce(
    (acc: number, subField: ParsedField) => acc + subField.bytes.length,
    0,
  ) == props.field.bytes.length;
</script>

<template>
  <div @click="handleClick" class="field-wrapper contents cursor-pointer">
    <div v-if="!fieldIsSelectedField()" class="contents">
      <BlockField
        :field="cutFieldBytes(field)"
        :cut="field.bytes.length > bytesCutoff"
        :fieldDef="fieldDef"
      ></BlockField>
    </div>
    <div v-else-if="!displaySubfields()" class="contents">
      <BlockField :field="field" :cut="false" :fieldDef="fieldDef"></BlockField>
    </div>
    <div v-else class="subfield-wrapper contents">
      <BlockField
        v-for="(subField, index) in 'subFields' in field ? field.subFields : []"
        :key="index"
        :field="subField"
        :cut="false"
        :fieldDef="fieldDef"
      ></BlockField>
    </div>
  </div>
</template>
