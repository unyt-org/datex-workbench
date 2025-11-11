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
});

const bytesCutoff: number = 30;

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');

const categories = [
  ['Magic Number', 'Version', 'Context ID', 'Section Index', 'Block Number'],
  ['Block Size', 'Flags', 'Flags and Timestamp', 'Lifetime'],
  ['Checksum', 'Signature', 'Encrypted Signature', 'IV'],
  ['Distance', 'TTL'],
  ['Sender', 'Number of Receivers', 'Receivers', 'Represented By', 'On Behalf Of'],
  ['Receivers Pointer ID', 'Receivers with Keys'],
];

function getCategoryColor(str: string) {
  const index = categories.findIndex((subArray) => subArray.includes(str));
  return `var(--color-chart-${index !== -1 ? (index % 5) + 1 : null}`;
}
</script>

<template>
  <div class="field-wrapper contents pl-[0.75ch]">
    <div
      v-for="(byte, indexInner) in field.bytes.slice(0, bytesCutoff)"
      :key="indexInner"
      :style="{ backgroundColor: getCategoryColor(field.name) }"
    >
      {{ uint8ToHexString(byte) }}
    </div>
    <div
      v-if="field.bytes.length > bytesCutoff"
      :style="{ backgroundColor: getCategoryColor(field.name) }"
    >
      ..
    </div>
  </div>
</template>

<style scoped>
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
