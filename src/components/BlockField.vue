<script setup lang="ts">
import type { FieldIdentifier } from '@/types/block-protocol-view';
import type { FieldDefinition, ParsedField } from '@unyt/speck';

const props = defineProps<{
  field: ParsedField;
  fieldDef: FieldDefinition | undefined;
  sectionId: number;
  fieldId: number;
  selectedField: FieldIdentifier | undefined;
}>();

const bytesCutoff: number = 25;

const emit = defineEmits(['field-clicked']);
const handleClick = () => {
  if (
    props.sectionId == props.selectedField?.sectionIndex &&
    props.fieldId == props.selectedField.fieldIndex
  ) {
    emit('field-clicked', undefined);
  } else {
    emit('field-clicked', {
      sectionIndex: props.sectionId,
      fieldIndex: props.fieldId,
    });
  }
};

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');
</script>

<template>
  <div class="field-wrapper contents cursor-pointer" @click="handleClick">
    <div
      v-for="(byte, indexInner) in props.sectionId == props.selectedField?.sectionIndex &&
      props.fieldId == props.selectedField.fieldIndex
        ? field.bytes
        : field.bytes.slice(0, bytesCutoff)"
      :key="indexInner"
    >
      <div
        class="padding-wrapper leading-tight"
        :style="{ backgroundColor: fieldDef?.category?.split('_').join('') }"
      >
        {{ uint8ToHexString(byte) }}
      </div>
    </div>
    <div v-if="!(props.sectionId == props.selectedField?.sectionIndex &&
      props.fieldId == props.selectedField.fieldIndex) && field.bytes.length > bytesCutoff">
      <div
        class="padding-wrapper leading-tight"
        :style="{ backgroundColor: fieldDef?.category?.split('_').join('') }"
      >
        ..
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-wrapper {
  --total-column-width: 3ch;
  --column-gap: 0.4ch;
  --byte-field-radius: var(--radius-sm);

  div {
    padding: calc(var(--column-gap) / 2) 0ch;
  }
  div:first-child {
    padding-left: calc(var(--column-gap) / 2);
    .padding-wrapper {
      padding-left: calc((var(--total-column-width) - 2ch - var(--column-gap)) / 2);
      border-bottom-left-radius: var(--byte-field-radius);
      border-top-left-radius: var(--byte-field-radius);
    }
  }
  :not(div:first-child) {
    .padding-wrapper {
      padding-left: calc((var(--total-column-width) - 2ch) / 2);
    }
  }
  div:last-child {
    padding-right: calc(var(--column-gap) / 2);
    .padding-wrapper {
      padding-right: calc((var(--total-column-width) - 2ch - var(--column-gap)) / 2);
      border-bottom-right-radius: var(--byte-field-radius);
      border-top-right-radius: var(--byte-field-radius);
    }
  }
  :not(div:last-child) {
    .padding-wrapper {
      padding-right: calc((var(--total-column-width) - 2ch) / 2);
    }
  }
}
</style>
