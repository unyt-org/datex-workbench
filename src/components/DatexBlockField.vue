<script setup lang="ts">
import type { ParsedField } from '@unyt/speck';
import { ref } from 'vue';

const props = defineProps<{
  field: ParsedField;
  indexOuter: number;
  fieldColor?: string; // Optional prop (use `?` and `string` instead of `String`)
}>();

const bytesCutoff: number = 25;
const isExpanded = ref(false);

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');

const emit = defineEmits(['field-clicked']);

const handleClicks = (expand: boolean) => {
  if (expand) {
    isExpanded.value = !isExpanded.value;
  }
  const data = structuredClone(props.field);
  data.color = props.fieldColor;
  emit('field-clicked', data);
};
</script>

<template>
  <div class="field-wrapper contents cursor-pointer" @click="handleClicks(true)">
    <div
      v-for="(byte, indexInner) in isExpanded ? field.bytes : field.bytes.slice(0, bytesCutoff)"
      :key="indexInner"
    >
      <div class="padding-wrapper" :style="{ backgroundColor: fieldColor }">
        {{ uint8ToHexString(byte) }}
      </div>
    </div>
    <div v-if="!isExpanded && field.bytes.length > bytesCutoff">
      <div class="padding-wrapper" :style="{ backgroundColor: fieldColor }">..</div>
    </div>
  </div>
</template>

<style>
.field-wrapper {
  div {
    padding: 0.25ch 0ch;
    line-height: 2.1ch;
  }
  div:first-child {
    padding-left: 0.2ch;
    .padding-wrapper {
      padding-left: 0.3ch;
      border-bottom-left-radius: 0.5ch;
      border-top-left-radius: 0.5ch;
    }
  }
  :not(div:first-child) {
    .padding-wrapper {
      padding-left: 0.5ch;
    }
  }
  div:last-child {
    padding-right: 0.2ch;
    .padding-wrapper {
      padding-right: 0.3ch;
      border-bottom-right-radius: 0.5ch;
      border-top-right-radius: 0.5ch;
    }
  }
  :not(div:last-child) {
    .padding-wrapper {
      padding-right: 0.5ch;
    }
  }
}

.padding-wrapper {
  padding-top: 0ch !important;
  padding-bottom: 0ch !important;
}
</style>
