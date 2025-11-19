<script setup lang="ts">
import BlockField from '@/components/BlockField.vue';
import type { ParsedField, ParsedSection, SectionDefinition } from '@unyt/speck';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  section: ParsedSection;
  sectionDef: SectionDefinition | undefined;
}>();
</script>

<template>
  <div class="text-foreground font-mono">
    <div class="grid-box grid" :style="`grid-template-columns: repeat(auto-fit, 3ch);`">
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
            :fieldDef="sectionDef?.fields[indexOuter]"
          />
        </div>
        <div v-else class="contents">
          <BlockField :field="field" :fieldDef="sectionDef?.fields[indexOuter]" />
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
