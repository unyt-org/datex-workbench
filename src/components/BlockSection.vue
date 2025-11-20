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
      <div
        v-for="(field, index) in section.fields"
        :key="index"
        class="contents"
        :class="`${
          !selectedField ||
          sectionId !== selectedField.sectionIndex ||
          index === selectedField.fieldIndex
            ? 'selected-field'
            : ''
        }`"
      >
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
</template>

<style>
.grid-box :not(.selected-field) div div div {
  filter: grayscale(100%) opacity(80%);
}

/* when hovering over a field in the grid-box, grey out all other fields and remove greyscale from hovered field */
.grid-box:has(.field-wrapper:hover) {
  div {
    :not(.field-wrapper:hover) div div {
      filter: grayscale(100%) opacity(80%);
    }
    .field-wrapper:hover div div {
      filter: none;
    }
  }
}


</style>
