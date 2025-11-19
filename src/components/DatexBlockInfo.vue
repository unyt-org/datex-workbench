<script setup lang="ts">
import type { ParsedField } from '@unyt/speck';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from '@/components/ui/table';
import Separator from './ui/separator/Separator.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  infoData: ParsedField & { color: string };
}>();

const emit = defineEmits(['close-button-clicked']);
const closeInfo = () => {
  emit('close-button-clicked')
}
</script>

<template>
  <!-- The basic data like name, id, description and parsed Value with headers and as regular text
  only the subfields as a table like I did but columns and rows reversed
  incooperate category color in some way
  -->
  <!-- x-Button top right to get rid of Info box as well as clicking the field a second time also gets rid of info box -->
  <!-- keep fields greyed out when viewing info in bottom view -->
  <!-- add tooltip when hovering over a byte containing the name of the field and the
  absolut byte offset of the whole block and where the field starts and ends as byte offset -->
  <div class="cursor-pointer" @click="closeInfo">x</div>
  <h1 class="text-md">{{ infoData.name }}</h1>
  <h2 v-if="'id' in infoData" class="text-xs">id: {{ infoData.id }}</h2>
  <Separator />
  <p v-if="'parsedValue' in infoData" class="break-all whitespace-break-spaces">Value: {{ infoData.parsedValue }}</p>
  <p>if possible, description</p>
  <div v-if="'subFields' in infoData">
    <p>Subfields</p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[30%]">Name</TableHead>
          <TableHead class="w-[30%]">Id</TableHead>
          <TableHead>parsedValue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(subField, i) in infoData.subFields" :key="i">
          <TableCell>{{ subField.name }}</TableCell>
          <TableCell>{{ 'id' in subField ? subField.id : '-' }}</TableCell>
          <TableCell>{{ 'parsedValue' in subField ? subField.parsedValue : '-' }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>
.info-grid {
  grid-template-columns: 1fr 1fr 3fr;
}
</style>
