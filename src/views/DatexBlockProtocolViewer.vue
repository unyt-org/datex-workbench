<script setup lang="ts">
import { parseStructure } from '@unyt/speck'
import DatexBlockSection from '@/components/DatexBlockSection.vue'

const jsonDataExample = await (
  await fetch(
    'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
  )
).json()
const blockDataExample: Uint8Array = new Uint8Array(
  await (
    await fetch(
      'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin',
    )
  ).arrayBuffer(),
)

const structure = parseStructure(jsonDataExample, blockDataExample)
</script>

<!-- sections: Routing Header, Block Header, Encrypted Header, Body -->
<!-- fields in sections: Magic Number, Checksum, TTL, ... -->

<template>
  <div class="BlockProtocolContainer">
    <DatexBlockSection
      v-for="(section, index) in structure"
      :key="index"
      :section="section"
    ></DatexBlockSection>
  </div>
</template>

<style scoped>
.BlockProtocolContainer {
  width: 100%;
  padding: 0.7rem;
  background-color: var(--color-background);
}
</style>
