<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/blockProtocolView';
import type { ParsedSection, SectionDefinition } from '@unyt/speck';
import BlockFieldWrapper from './BlockFieldWrapper.vue';

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
    <div class="grid" style="grid-template-columns: repeat(auto-fit, 3ch)">
      <div
        v-for="(field, index) in section.fields"
        :key="index"
        class="contents"
        :class="`${
          selectedField &&
          sectionId === selectedField.sectionIndex &&
          index === selectedField.fieldIndex
            ? 'selected-field'
            : ''
        }`"
      >
        <BlockFieldWrapper
          :field="field"
          :fieldDef="sectionDef?.fields.find((fi) => fi.name === field.name)"
          :sectionId="sectionId"
          :fieldId="index"
          :selectedField="selectedField"
          @field-clicked="handleFieldClick"
        />
      </div>
    </div>
  </div>
</template>
