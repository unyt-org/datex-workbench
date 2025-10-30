<script setup lang="ts">
import DatexBlockField from "@/components/DatexBlockField.vue";

const blocks = [
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
        :backgroundColor="`var(--color-chart-${index % 3 + 1})`"
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
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 1rem;
  background-color: var(--color-card);
  border-radius: 0.5rem;
}
</style>
