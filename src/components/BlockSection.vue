<script setup lang="ts">
import BlockField from '@/components/BlockField.vue';
import type { ParsedField, ParsedSection } from '@unyt/speck';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  section: ParsedSection;
}>();

const categories = [
  ['Magic Number', 'Version', 'Context ID', 'Section Index', 'Block Number'],
  ['Block Size', 'Flags', 'Flags and Timestamp', 'Lifetime'],
  ['Distance', 'TTL'],
  ['Sender', 'Number of Receivers', 'Receivers', 'Represented By', 'On Behalf Of'],
  ['Receivers Pointer ID', 'Receivers with Keys'],
  ['Checksum', 'Signature', 'Encrypted Signature', 'IV'],
];

function getCategoryColor(str: string) {
  const index = categories.findIndex((subArray) => subArray.includes(str));
  return `var(--chart-${((index + 5) % 5) + 1})`;
}
</script>

<template>
  <div class="text-foreground font-mono">
    <div ref="box" class="grid-box grid" :style="`grid-template-columns: repeat(auto-fit, 3ch);`">
      <div v-for="(field, indexOuter) in section.fields" :key="indexOuter" class="contents">
        <div
          v-if="
            'subFields' in field &&
            field.bytes.length ==
              field.subFields.reduce(
                (acc: number, subField: ParsedField) => acc + subField.bytes.length,
                0,
              )
          "
          class="contents"
        >
          <BlockField
            v-for="(subField, index) in field.subFields"
            :key="index"
            :field="subField"
            :indexOuter="indexOuter"
            :fieldColor="getCategoryColor(field.name)"
          />
        </div>
        <div v-else class="contents">
          <BlockField
            :field="field"
            :indexOuter="indexOuter"
            :fieldColor="getCategoryColor(field.name)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/*
.grid-box:has(.field-wrapper:hover)
selects all divs that have a field-wrapper child that is being hovered over
if we leave this :has out, the greyscale will always apply and the colorizing still works
but this start is kind of like initializing that any greyscaling only happens when we hover over something
an almost similar example happens when we just write .grid-box:hover. Only that this way hovering over the gaps of the grid also greys out the rest
*/
.grid-box:has(.field-wrapper:hover) {
  div div :not(.field-wrapper:hover) {
    div div {
      filter: grayscale(100%) opacity(80%);
    }
  }
}
</style>
