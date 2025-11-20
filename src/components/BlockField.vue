<script setup lang="ts">
import type { FieldIdentifier } from '@/types/block-protocol-view';
import type { FieldDefinition, ParsedField } from '@unyt/speck';
import BlockFieldWrapper from './BlockFieldWrapper.vue';

const props = defineProps<{
  field: ParsedField;
  fieldDef: FieldDefinition | undefined;
  sectionId: number;
  fieldId: number;
  selectedField: FieldIdentifier | undefined;
}>();

const emit = defineEmits(['field-clicked']);
const handleFieldWrapperClick = (data: FieldIdentifier | undefined) => {
  emit('field-clicked', data);
};

const subFieldsMatchBytes = () =>
  'subFields' in props.field &&
  props.field.subFields.reduce(
    (acc: number, subField: ParsedField) => acc + subField.bytes.length,
    0,
  ) == props.field.bytes.length;
</script>

<template>
  <div v-if="'subFields' in field && subFieldsMatchBytes()" class="contents">
    <BlockFieldWrapper
      v-for="(subField, index) in field.subFields"
      :key="index"
      :field="subField"
      :fieldDef="fieldDef"
      :sectionId="sectionId"
      :fieldId="fieldId"
      :selectedField="selectedField"
      @field-wrapper-clicked="handleFieldWrapperClick"
    ></BlockFieldWrapper>
  </div>
  <div v-else class="contents">
    <BlockFieldWrapper
      :field="field"
      :fieldDef="fieldDef"
      :sectionId="sectionId"
      :fieldId="fieldId"
      :selectedField="selectedField"
      @field-wrapper-clicked="handleFieldWrapperClick"
    ></BlockFieldWrapper>
  </div>
</template>
