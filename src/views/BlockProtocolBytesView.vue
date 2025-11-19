<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ParsedStructure, StructureDefinition } from '@unyt/speck';
import BlockSection from '@/components/BlockSection.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  structure: ParsedStructure;
  structureDef: StructureDefinition | undefined;
}>();

const emit = defineEmits(['bytes-section-field-clicked']);
const handleSectionFieldClick = (data: { section: string; field: string }) => {
  emit('bytes-section-field-clicked', data);
};
</script>

<template>
  <Accordion type="multiple">
    <AccordionItem
      v-for="(section, index) in structure"
      :key="index"
      :value="`item-${index}`"
      class="last:border-b-0"
    >
      <AccordionTrigger class="text-foreground text-md cursor-pointer py-3 hover:no-underline">{{
        section.name
      }}</AccordionTrigger>
      <AccordionContent>
        <BlockSection
          v-if="section.fields.length > 0"
          :section="section"
          :sectionDef="structureDef?.sections[index]"
          @section-field-clicked="handleSectionFieldClick"
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
