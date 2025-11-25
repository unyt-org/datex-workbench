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

<!-- DONE don't seperate subfields when the field is not expanded -->
<!-- DONE when expanded, each subfield should have an additional exta hover effect -->
<!-- PENDING when hovering field in one section, also grey out all fields in the other sections -->
<!-- PENDING use lucide icons to replace x button -->
<!-- PENDING also change theme switcher to lucide -->
<!-- https://lucide.dev/icons/ -->
<!-- PENDING Do correct line break in the info view table for things like Key, subField of Recievers with key -->
<!-- PENDING generally clean up the Info Box even more -->

<template>
  <div @click="handleClick" class="contents cursor-pointer">
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
    <div v-else class="contents">
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
