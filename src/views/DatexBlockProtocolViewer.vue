<script setup lang="ts">
import { parseStructure } from '@unyt/speck'
import DatexBlockSection from '@/components/DatexBlockSection.vue'

const jsonData = await (
  await fetch(
    'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
  )
).json()
const blockData: Uint8Array = new Uint8Array(
  await (
    await fetch(
      'https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin',
    )
  ).arrayBuffer(),
)

const structureTest = parseStructure(jsonData, blockData)
console.log(structureTest)
</script>

<!-- sections: Routing Header, Block Header, Encrypted Header, Body -->
<!-- fields in sections: Magic Number, Checksum, TTL, ... -->

<template>
  <div class="BlockProtocolContainer">
    <DatexBlockSection
      v-for="(section, index) in structureTest"
      :key="index"
      :section="section"
    ></DatexBlockSection>
  </div>
</template>

<style scoped>
.BlockProtocolContainer {
  padding: 0.5rem;
  background-color: var(--color-muted);
  width: 100%;
}
</style>
