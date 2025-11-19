<script setup lang="ts">
import type { ParsedStructure, StructureDefinition } from '@unyt/speck';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import type { FieldIdentifier } from '@/types/block-protocol-view';
import { computed } from 'vue';

const props = defineProps<{
  structure: ParsedStructure;
  structureDef: StructureDefinition | undefined;
  selectedField: FieldIdentifier;
}>();

const emit = defineEmits(['close-button-clicked']);
const closeInfo = () => {
  emit('close-button-clicked');
};

const field = computed(
  () => props.structure[props.selectedField.sectionIndex]?.fields[props.selectedField.fieldIndex],
);
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

  <div v-if="field">
    <div class="cursor-pointer" @click="closeInfo">x</div>
    <h1 class="text-lg">{{ field.name }}</h1>
    <h2 v-if="'id' in field" class="text-xs">id: {{ field.id }}</h2>
    <Separator />
    <p v-if="'parsedValue' in field" class="text-sm">Value: {{ field.parsedValue }}</p>
    <!-- <p>if possible, description</p> -->
    <div v-if="'subFields' in field">
      <p class="text-sm">Subfields</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[30%]">Name</TableHead>
            <TableHead class="w-[30%]">Id</TableHead>
            <TableHead>parsedValue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(subField, i) in field.subFields" :key="i">
            <TableCell>{{ subField.name }}</TableCell>
            <TableCell>{{ 'id' in subField ? subField.id : '-' }}</TableCell>
            <TableCell>{{ 'parsedValue' in subField ? subField.parsedValue : '-' }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<style scoped>
.info-grid {
  grid-template-columns: 1fr 1fr 3fr;
}
</style>
