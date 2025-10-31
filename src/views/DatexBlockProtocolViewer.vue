<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import DatexBlockField from "@/components/DatexBlockField.vue";
// import { generateStructure, SectionDefinition } from "@unyt/speck";

const route = useRoute()

const loading = ref(false)
const jsonData = ref(null)
const binaryData = ref<ArrayBuffer | null>(null);;
const error = ref(null)

// watch the params of the route to fetch the data again
watch(() => route.params.id, fetchData, { immediate: true })

async function fetchData() {
  error.value = jsonData.value = null
  loading.value = true

  try {
    const jsonResponse = await fetch('https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json');
    jsonData.value = await jsonResponse.json();

    const binaryResponse = await fetch('https://raw.githubusercontent.com/unyt-org/datex-core/main/tests/structs/receivers_with_keys/block.bin');
    binaryData.value = await binaryResponse.arrayBuffer();
  } catch (err) {
    console.error('Fehler beim Laden der Dateien:', err);
  } finally {
    loading.value = false
  }
}

watch(jsonData, (newJsonData) => {
  if (newJsonData) {
    console.log(newJsonData.sections[0].fields);
  }
}, { immediate: true });
</script>

<template>
  <div class="post">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="jsonData" class="BlockProtocolContainer">
      <div class="RoutingHeaderContainer">
        <DatexBlockField
          v-for="(field, index) in jsonData.sections[0].fields"
          :key="index"
          :backgroundColor="field.category.replace(/_/g, '')"
          :text="field.name"
          :span="field.byteSize"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.BlockProtocolContainer {
  padding: 0.5rem;
  background-color: var(--color-muted);
  width: 100%;
}

.RoutingHeaderContainer {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--color-card);
  border-radius: 0.5rem;
}
</style>
