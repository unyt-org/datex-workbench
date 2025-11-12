<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  indexOuter: {
    type: Number,
    required: true,
  },
  fieldColor: {
    type: String,
    required: false,
  },
});

const bytesCutoff: number = 30;

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');
</script>

<template>
  <div class="field-wrapper contents">
    <div
      v-for="(byte, indexInner) in field.bytes.slice(0, bytesCutoff)"
      :key="indexInner"
      :style="{ backgroundColor: fieldColor }"
    >
      {{ uint8ToHexString(byte) }}
    </div>
    <div v-if="field.bytes.length > bytesCutoff" :style="{ backgroundColor: fieldColor }">..</div>
  </div>
</template>

<style>

.field-wrapper div {
  padding-left: 0.75ch;
}

.field-wrapper div:first-child {
  border-bottom-left-radius: var(--radius-sm);
  border-top-left-radius: var(--radius-sm);
  margin-left: 0.25ch;
  padding-left: 0.5ch;
}

.field-wrapper div:last-child {
  border-bottom-right-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
  margin-right: 0.25ch;
  padding-right: 0.25ch;
}
</style>
