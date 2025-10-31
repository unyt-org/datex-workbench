<script setup lang="ts">
import DatexBlockField from "@/components/DatexBlockField.vue";

// import { generateStructure, SectionDefinition } from "@unyt/speck";

// wie greife ich auf das aktuellste .json zu?
// liegt im repo speck/examples immer das aktuellste Format der dxb.json?
// wie kann ich darauf dynamisch zugreifen, sodass sich auch bei Änderungen mein import nicht ändern muss?

// ist es sinnvoll in diesem Branch ein paar Beispiel .bin files vorübergehend abzulegen, die ich als Vorlage benutzen kann,
// bevor dann genauer definiert wird aus welcher Quelle diese bin files zu meiner Component geraten?

async function loadFiles() {
  try {
    const binaryResponse = await fetch('https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin');
    const binaryData = await binaryResponse.arrayBuffer();

    const jsonResponse = await fetch('https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json');
    const jsonData = await jsonResponse.json();

    console.log('Binary-Daten:', binaryData);
    console.log('JSON-Daten:', jsonData.sections[0]);

    return { binaryData, jsonData };
  } catch (error) {
    console.error('Fehler beim Laden der Dateien:', error);
  }
}

loadFiles()


const blocks = [
  { span: 2 },
  { span: 1 },
  { span: 2 },
  { span: 1 },
  { span: 2 },
  { span: 2 },
  { span: 1 },
  { span: 4 },
  { span: 1 },
  { span: 7 },
  { span: 2 },
  { span: 1 },
  { span: 2 },
  { span: 1 },
  { span: 2 },
  { span: 2 },
];
</script>

<template>
  <div class="BlockProtocolContainer">
    <div class="RoutingHeaderContainer">
      <DatexBlockField
        v-for="(block, index) in blocks"
        :key="index"
        :backgroundColor="`var(--chart-${index % 3 + 1})`"
        :text="`Block ${index + 1}`"
        :span="block.span"
      />
    </div>
  </div>
</template>

<style scoped>
.BlockProtocolContainer {
  padding: 1rem;
  background-color: var(--color-muted);
  width: 100%;
}

.RoutingHeaderContainer {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--color-card);
  border-radius: 0.5rem;
}
</style>
