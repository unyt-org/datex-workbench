<script setup lang="ts">
import BlockField from '@/components/BlockField.vue';
import type { FieldIdentifier } from '@/types/block-protocol-view';
import type { ParsedSection, SectionDefinition } from '@unyt/speck';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  section: ParsedSection;
  sectionDef: SectionDefinition | undefined;
  sectionId: number;
  selectedField: FieldIdentifier | undefined;
}>();

const emit = defineEmits(['section-field-clicked']);
const handleFieldClick = (data: FieldIdentifier | undefined) => {
  emit('section-field-clicked', data);
};
</script>

<template>
  <div class="text-foreground font-mono">
    <div class="grid-box grid" :style="`grid-template-columns: repeat(auto-fit, 3ch);`">
      <div v-for="(field, index) in section.fields" :key="index" class="contents">
        <div class="contents">
          <BlockField
            :field="field"
            :fieldDef="sectionDef?.fields[index]"
            :sectionId="sectionId"
            :fieldId="index"
            :selectedField="selectedField"
            @field-clicked="handleFieldClick"
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
