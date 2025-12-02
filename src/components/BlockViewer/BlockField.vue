<script setup lang="ts">
import type { FieldDefinition, ParsedField } from '@unyt/speck';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  field: ParsedField;
  cut: boolean;
  fieldDef: FieldDefinition | undefined;
}>();

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');

const CATEGORIES = ['purple', 'red', 'yellow', 'green', 'blue', 'dark_blue'];
const getColor = (s: string | undefined): string => {
  if (!s) return 'var(--chart-1)';

  const index = CATEGORIES.findIndex((color) => s === color);
  return index !== -1 ? `var(--chart-${index + 1})` : 'var(--chart-1)';
};
</script>

<template>
  <div class="field-styling contents">
    <div v-for="(byte, indexInner) in field.bytes" :key="indexInner">
      <div
        class="byte-wrapper leading-tight"
        :style="{ backgroundColor: getColor(fieldDef?.category) }"
      >
        {{ uint8ToHexString(byte) }}
      </div>
    </div>
    <div v-if="cut">
      <div
        class="byte-wrapper leading-tight"
        :style="{ backgroundColor: getColor(fieldDef?.category) }"
      >
        ..
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-styling {
  --total-column-width: 3ch;
  --column-gap: 0.4ch;
  --byte-field-radius: var(--radius-sm);

  div {
    padding: calc(var(--column-gap) / 2) 0ch;
  }

  div:first-child {
    padding-left: calc(var(--column-gap) / 2);

    .byte-wrapper {
      padding-left: calc((var(--total-column-width) - 2ch - var(--column-gap)) / 2);
      border-bottom-left-radius: var(--byte-field-radius);
      border-top-left-radius: var(--byte-field-radius);
    }
  }

  :not(div:first-child) {
    .byte-wrapper {
      padding-left: calc((var(--total-column-width) - 2ch) / 2);
    }
  }

  div:last-child {
    padding-right: calc(var(--column-gap) / 2);

    .byte-wrapper {
      padding-right: calc((var(--total-column-width) - 2ch - var(--column-gap)) / 2);
      border-bottom-right-radius: var(--byte-field-radius);
      border-top-right-radius: var(--byte-field-radius);
    }
  }

  :not(div:last-child) {
    .byte-wrapper {
      padding-right: calc((var(--total-column-width) - 2ch) / 2);
    }
  }
}
</style>
