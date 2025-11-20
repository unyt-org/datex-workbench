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
  console.log(props.field);
  console.log(props.fieldDef);
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

const expand = () =>
  props.sectionId == props.selectedField?.sectionIndex &&
  props.fieldId == props.selectedField.fieldIndex;

const categories = ['purple', 'red', 'yellow', 'green', 'blue', 'dark_blue'];
const getColorIndex = (s: string | undefined): number =>
  categories.findIndex((color) => s === color) + 1;
</script>

<!--
also aktueller Stand
an sich funktioniert alles, nur die subfields werden noch nicht getrennt voneinander angezeigt
Ich muss also erst schauen ob es Subfields gibt. Ist dies der Fall wird jedes Subfield einzeln wie ein reguläres field ohne subFields behandelt.

Und dann muss ein field was zu lang ist beim cutoff enden und man macht ... danach.
-->

<template>
  <div
    v-if="
      'subFields' in field &&
      field.subFields.reduce(
        (acc: number, subField: ParsedField) => acc + subField.bytes.length,
        0,
      ) == field.bytes.length
    "
    class="contents"
  >
    <div
      v-for="(subField, index) in field.subFields"
      :key="index"
      class="field-wrapper contents cursor-pointer"
      @click="handleClick"
    >
      <div
        v-for="(byte, indexInner) in expand()
          ? subField.bytes
          : subField.bytes.slice(0, bytesCutoff)"
        :key="indexInner"
      >
        <div
          class="padding-wrapper leading-tight"
          :style="{ backgroundColor: `var(--chart-${getColorIndex(fieldDef?.category)})` }"
        >
          {{ uint8ToHexString(byte) }}
        </div>
      </div>
      <div v-if="!expand() && subField.bytes.length > bytesCutoff">
        <div
          class="padding-wrapper leading-tight"
          :style="{ backgroundColor: `var(--chart-${getColorIndex(fieldDef?.category)})` }"
        >
          ..
        </div>
      </div>
    </div>
  </div>
  <div v-else class="contents">
    <div class="field-wrapper contents cursor-pointer" @click="handleClick">
      <div
        v-for="(byte, indexInner) in expand() ? field.bytes : field.bytes.slice(0, bytesCutoff)"
        :key="indexInner"
      >
        <div
          class="padding-wrapper leading-tight"
          :style="{ backgroundColor: `var(--chart-${getColorIndex(fieldDef?.category)})` }"
        >
          {{ uint8ToHexString(byte) }}
        </div>
      </div>
      <div v-if="!expand() && field.bytes.length > bytesCutoff">
        <div
          class="padding-wrapper leading-tight"
          :style="{ backgroundColor: `var(--chart-${getColorIndex(fieldDef?.category)})` }"
        >
          ..
        </div>
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
