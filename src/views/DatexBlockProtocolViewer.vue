<script setup lang="ts">
import { parseStructure } from '@unyt/speck';
import DatexBlockSection from '@/components/DatexBlockSection.vue';
import { ref } from 'vue';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const jsonDataExample = await (
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

const clickedValue = ref(null);

const handleSectionFieldClick = (data) => {
  clickedValue.value = data;
};
</script>

<template>
  <Accordion
    type="multiple"
    class="bg-background m-2 h-3/5 overflow-y-auto rounded-lg border border-gray-300 p-[0.7rem]"
  >
    <AccordionItem
      v-for="(section, index) in structure"
      :key="index"
      :section="section"
      :value="`item-${index}`"
    >
      <AccordionTrigger class="text-foreground text-4xl">{{ section.name }}</AccordionTrigger>
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
    v-if="clickedValue"
    class="bg-background m-2 h-1/3 overflow-y-auto rounded-lg border border-gray-300 p-[0.7rem] text-foreground "
  >
    <div :style="{backgroundColor: clickedValue.color}" class="rounded-[0.5ch] pl-[0.5ch] h-lh-[2.1ch] ">{{ clickedValue.name }}</div>
    <div style="word-break: break-all;">Parsed Value: {{ clickedValue.parsedValue }}</div>
    <div v-if="Object.hasOwn(clickedValue, 'subFields')">SubFields: {{ clickedValue.subFields.map((e) => e.name) }}</div>
  </div>
</template>
