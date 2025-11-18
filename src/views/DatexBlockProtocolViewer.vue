<script setup lang="ts">
import { parseStructure, type ParsedField } from '@unyt/speck';
import DatexBlockSection from '@/components/DatexBlockSection.vue';
import { ref } from 'vue';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DatexBlockInfo from '@/components/DatexBlockInfo.vue';

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

const clickedValue = ref<ParsedField & { color: string }>();

const handleSectionFieldClick = (data: ParsedField & { color: string }) => {
  clickedValue.value = data;
};
</script>

<template>
  <!-- this is only temporarily static -->
  <div class="h-[calc(100%-15px)]">
    <Accordion
      type="multiple"
      class="bg-background m-1 max-h-3/5 overflow-y-auto rounded-lg border p-[0.7rem]"
    >
      <AccordionItem
        v-for="(section, index) in structure"
        :key="index"
        :section="section"
        :value="`item-${index}`"
      >
        <AccordionTrigger class="text-foreground text-3xl">{{ section.name }}</AccordionTrigger>
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
      class="bg-background text-foreground m-1 max-h-2/5 overflow-y-auto rounded-lg border p-[0.7rem]"
    >
      <DatexBlockInfo :infoData="clickedValue"></DatexBlockInfo>
    </div>
  </div>
</template>
<!-- next steps
make the "more info" tab prettier
if more info is shown for a selected section, keep the other sections greyed out

integrate what I've done so far with olivers window system
-->

<style>
.temp {
  border-radius: calc(var(--radius) - 2px);
}
</style>
