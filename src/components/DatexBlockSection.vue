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
    <div class="FieldsFlexBox">
      <DatexBlockField
        v-for="(field, index) in section.fields"
        :key="index"
        :field="field"
      ></DatexBlockField>
    </div>
  </div>
</template>

<style scoped>
.BlockProtocolSection {
  background-color: var(--color-secondary);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
}

.SectionName {
  font-size: 2rem;
}

.FieldsFlexBox {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.4ch;
  /** each Field itself is padded with 0.3ch+0.3ch
      plus gap of flex items of 0.4ch
      ensures that all monospace byte characters stay aligned vertically
  */
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;

  font-family: monospace;
  font-size: 1rem;
}
</style>
