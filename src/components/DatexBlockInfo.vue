<script setup lang="ts">
import Separator from '@/components/ui/separator/Separator.vue';
import type { ParsedField } from '@unyt/speck';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  infoData: ParsedField & { color: string };
}>();
</script>

<template>
  <div class="info-grid grid gap-1">
    <div class="contents">
      <div class="col-span-2">Name</div>
      <div class="break-all">{{ infoData.name }}</div>
    </div>
    <div v-if="'id' in infoData" class="contents">
      <Separator class="col-span-full" />
      <div class="col-span-2">Id</div>
      <div class="break-all">{{ infoData.id }}</div>
    </div>
    <div v-if="'parsedValue' in infoData" class="contents">
      <Separator class="col-span-full" />
      <div class="col-span-2">Parsed Value</div>
      <div class="break-all">{{ infoData.parsedValue }}</div>
    </div>
    <div v-if="'subFields' in infoData" class="contents">
      <Separator class="col-span-full" />
      <div>subFields</div>
      <div class="col-span-2 grid grid-cols-subgrid">
        <div v-for="(subField, i) in infoData.subFields" :key="i" class="contents">
          <div class="contents">
            <div>Name</div>
            <div class="break-all">{{ subField.name }}</div>
            <Separator class="col-span-full" />
          </div>
          <div v-if="'id' in subField" class="contents">
            <div>Id</div>
            <div class="break-all">{{ subField.id }}</div>
            <Separator class="col-span-full" />
          </div>
          <div v-if="'parsedValue' in subField" class="contents">
            <div>Parsed Value</div>
            <div class="break-all">{{ subField.parsedValue }}</div>
            <Separator class="col-span-full" />
          </div>
          <div class="col-span-full h-4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-grid {
  grid-template-columns: 1fr 1fr 3fr;
}
</style>
