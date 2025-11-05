<script setup lang="ts">
import DatexBlockField from './DatexBlockField.vue'
import { onMounted } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

onMounted(() => {
  console.log('Field object:', props.section)
})
</script>

<template>
  <div class="BlockProtocolSection">
    <div class="SectionName">{{ section.name }}</div>
    <div class="FieldsGrid">
      <DatexBlockField
        v-for="(field, index) in section.fields"
        :key="index"
        :field="field"
      ></DatexBlockField>
    </div>
  </div>
</template>

<style>
.BlockProtocolSection {
  background-color: var(--color-background);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
}

.SectionName {
  font-size: x-large;
}

.FieldsGrid {
  display: grid;
  grid-template-columns: repeat(5, 20%);
}
</style>
