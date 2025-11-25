<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ParsedStructure, StructureDefinition } from '@unyt/speck';
import BlockSection from '@/components/BlockSection.vue';
import type { FieldIdentifier } from '@/types/block-protocol-view';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  structure: ParsedStructure;
  structureDef: StructureDefinition | undefined;
  selectedField: FieldIdentifier | undefined;
}>();

const emit = defineEmits(['bytes-section-field-clicked']);
const handleSectionFieldClick = (data: FieldIdentifier | undefined) => {
  emit('bytes-section-field-clicked', data);
};

// console.log(props.structureDef?.sections.find(sect => sect.name === props.structure[0]?.name))
</script>

<template>
  <Accordion type="multiple" class="sections-wrapper">
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
          :sectionDef="structureDef?.sections.find((sect) => sect.name == section.name)"
          :sectionId="index"
          :selectedField="selectedField"
          @section-field-clicked="handleSectionFieldClick"
          class="section"
        />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<style>
/* field selection */

/* if a field is selected */
.sections-wrapper:has(.selected-field) {
  /* grey out all other sections */
  .section:not(:has(.selected-field)) {
    .byte-wrapper {
      filter: grayscale(100%) opacity(80%);
    }
  }

  /* grey out all other fields in the section with the selected field */
  .section:has(.selected-field) {
    :not(.selected-field) .byte-wrapper {
      filter: grayscale(100%) opacity(80%);
    }

    /* leave selected field colored */
    .selected-field .byte-wrapper {
      filter: none;
    }
  }
}

/* if no field is selected */
.sections-wrapper:not(:has(.selected-field)) {
  /* leave all fields colored */
  .byte-wrapper {
    filter: none;
  }
}

/* field hovering */

.section-wrapper:has(.field-wrapper:hover) {
  .section:not(:has(.field-wrapper:hover)) {
    .byte-wrapper {
      filter: grayscale(100%) opacity(80%);
    }
  }
}

/* hovering should grey out everything, every other field in this and every other section */

/* .section:has(.field-wrapper:hover) div div {
  .field-wrapper:hover div div div div {
    filter: none;
  }
  :not(.field-wrapper:hover) div div div div {
    filter: grayscale(100%) opacity(80%);
  }
} */
</style>
