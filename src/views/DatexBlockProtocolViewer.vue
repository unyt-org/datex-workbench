<script setup lang="ts">
import { parseStructure } from '@unyt/speck';
import DatexBlockSection from '@/components/DatexBlockSection.vue';
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
</script>

<template>
  <Accordion type="multiple" class="bg-background w-full p-[0.7rem] overflow-y-auto max-h-screen">
    <div v-for="(section, index) in structure" :key="index" :section="section">
      <AccordionItem :value="`item-${index}`">
        <AccordionTrigger class="text-4xl text-foreground">{{ section.name }}</AccordionTrigger>
        <AccordionContent>
          <DatexBlockSection :section="section"> </DatexBlockSection>
        </AccordionContent>
      </AccordionItem>
    </div>
  </Accordion>
</template>
