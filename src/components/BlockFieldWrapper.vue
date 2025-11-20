<script setup lang="ts">
import type { FieldIdentifier } from '@/types/block-protocol-view';
import type { FieldDefinition, ParsedField } from '@unyt/speck';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  field: ParsedField;
  fieldDef: FieldDefinition | undefined;
  sectionId: number;
  fieldId: number;
  selectedField: FieldIdentifier | undefined;
}>();

const emit = defineEmits(['field-wrapper-clicked']);
const handleClick = () => {
  console.log(props.field);
  console.log(props.fieldDef);
  if (
    props.sectionId == props.selectedField?.sectionIndex &&
    props.fieldId == props.selectedField.fieldIndex
  ) {
    emit('field-wrapper-clicked', undefined);
  } else {
    emit('field-wrapper-clicked', {
      sectionIndex: props.sectionId,
      fieldIndex: props.fieldId,
    });
  }
};

const bytesCutoff: number = 25;
const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');

const thisFieldIsSelectedField = () =>
  !(props.sectionId == props.selectedField?.sectionIndex) ||
  !(props.fieldId == props.selectedField.fieldIndex);

const categories = ['purple', 'red', 'yellow', 'green', 'blue', 'dark_blue'];
const getColor = (s: string | undefined): string => {
  if (!s) return 'var(--chart-1)';

  const index = categories.findIndex((color) => s === color);
  return index !== -1 ? `var(--chart-${index + 1})` : 'var(--chart-1)';
};
</script>

<template>
  <div class="field-wrapper contents cursor-pointer" @click="handleClick">
    <div
      v-for="(byte, indexInner) in thisFieldIsSelectedField()
        ? field.bytes.slice(0, bytesCutoff)
        : field.bytes"
      :key="indexInner"
    >
      <div
        class="padding-wrapper leading-tight"
        :style="{ backgroundColor: getColor(fieldDef?.category) }"
      >
        {{ uint8ToHexString(byte) }}
      </div>
    </div>
    <div v-if="thisFieldIsSelectedField() && field.bytes.length > bytesCutoff">
      <div
        class="padding-wrapper leading-tight"
        :style="{ backgroundColor: getColor(fieldDef?.category) }"
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
