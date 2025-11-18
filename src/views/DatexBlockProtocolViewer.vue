<script setup lang="ts">
import { parseStructure, type ParsedField , type StructureDefinition} from '@unyt/speck';
import DatexBlockSection from '@/components/DatexBlockSection.vue';
import { ref } from 'vue';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DatexBlockInfo from '@/components/DatexBlockInfo.vue';

// this will later not be fetched from the example data
const jsonDataExample : StructureDefinition = await (
  await fetch(
    'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
  )
).json();
const blockDataExample: Uint8Array = new Uint8Array(
  await (
    await fetch(
      'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin',
    )
  ).arrayBuffer(),
);
const structure = parseStructure(jsonDataExample, blockDataExample);
// use this for more info ;)
console.log(jsonDataExample)


const clickedField = ref<ParsedField & { color: string }>();
const handleSectionFieldClick = (data: ParsedField & { color: string }) => {
  clickedField.value = data;
};
</script>

<template>
  <!-- this is only temporarily static -->
  <div class="h-[calc(100%-15px)]">
    <Accordion
      type="multiple"
      class="bg-background m-1 max-h-3/5 overflow-y-auto rounded-lg border px-4"
    >
      <AccordionItem
        v-for="(section, index) in structure"
        :key="index"
        :section="section"
        :value="`item-${index}`"
        class="last:border-b-0"
      >
        <AccordionTrigger class="text-foreground text-md py-3 hover:no-underline cursor-pointer">{{ section.name }}</AccordionTrigger>
        <AccordionContent>
          <DatexBlockSection
            v-if="section.fields.length > 0"
            :section="section"
            @section-field-clicked="handleSectionFieldClick"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    <div
      v-if="clickedField"
      class="bg-background text-foreground m-1 max-h-2/5 overflow-y-auto rounded-lg border px-4"
    >
      <DatexBlockInfo :infoData="clickedField"></DatexBlockInfo>
    </div>
  </div>
</template>
