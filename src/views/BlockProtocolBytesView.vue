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
</script>

<template>
  <Accordion type="multiple" class="sections-wrapper" :unmountOnHide="false">
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
.sections-wrapper {
  --grey-out: grayscale(100%) opacity(80%);

  /* default color when no field is selected */
  &:not(:has(.selected-field)) {
    .byte-wrapper {
      filter: none;
    }
  }

  /* Field selecting */
  &:has(.selected-field) {
    /* Grey out all other sections */
    .section:not(:has(.selected-field)) {
      .byte-wrapper {
        filter: var(--grey-out);
      }
    }
    /* Grey out all other fields in the section with the selected field */
    .section:has(.selected-field) {
      :not(.selected-field) .byte-wrapper {
        filter: var(--grey-out);
      }
      /* Leave selected field colored */
      .selected-field .byte-wrapper {
        filter: none;
      }
    }
  }

  /* Field hovering */
  &:has(.field-wrapper:hover) {
    .section:not(:has(.field-wrapper:hover)) {
      /* Selected field stays colored when hovering other field */
      .byte-wrapper:not(.selected-field .byte-wrapper) {
        filter: var(--grey-out);
      }
    }
    .section:has(.field-wrapper:hover) {
      .field-wrapper {
        &:hover {
          .byte-wrapper {
            /* border: 1px solid white; */
            filter: none;
          }
        }
        &:not(:hover) .byte-wrapper:not(.selected-field .byte-wrapper) {
          filter: var(--grey-out);
        }
        .byte-wrapper:hover {
          filter: hue-rotate(10deg);
        }
      }

      .subfield-wrapper .field-styling:hover .byte-wrapper {
        filter: brightness(1.3);
      }
    }
  }
}
</style>
