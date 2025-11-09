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

<!-- sections: Routing Header, Block Header, Encrypted Header, Body -->
<!-- fields in sections: Magic Number, Checksum, TTL, ... -->

<template>
  <Accordion type="multiple" class="BlockProtocolContainer">
    <div v-for="(section, index) in structure" :key="index" :section="section">
      <AccordionItem :value="`item-${index}`">
        <AccordionTrigger style="font-size: 2rem">{{ section.name }}</AccordionTrigger>
        <AccordionContent>
          <DatexBlockSection :section="section"> </DatexBlockSection>
        </AccordionContent>
      </AccordionItem>
    </div>
  </Accordion>
</template>

<style scoped>
.BlockProtocolContainer {
  width: 100%;
  padding: 0.7rem;
  background-color: var(--color-background);
}
</style>
