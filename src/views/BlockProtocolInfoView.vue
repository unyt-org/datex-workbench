<script setup lang="ts">
import type { ParsedStructure, StructureDefinition } from '@unyt/speck';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
  TableCaption,
} from '@/components/ui/table';
import type { FieldIdentifier } from '@/types/block-protocol-view';
import { computed } from 'vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { X } from 'lucide-vue-next';

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
console.log(field);
</script>

<template>
  <div v-if="field" class="contents">
    <div class="px-4">
      <div
        class="text-foreground text-md flex flex-1 items-center justify-between font-medium"
      >
        <div class="py-4 has-[p]:pb-0">
          {{ field.name }}
          <p v-if="'id' in field" class="text-xs">id: {{ field.id }}</p>
        </div>
        <X
          class="hover:text-muted-foreground flex size-4 h-4 w-4 shrink-0 cursor-pointer items-center justify-center"
          @click="closeInfo"
        />
      </div>
      <Separator />
      <p v-if="'parsedValue' in field" class="py-2 text-sm">
        Value: {{ String(field.parsedValue) }}
      </p>
      <!-- <p>if possible, description</p> -->
    </div>
    <div v-if="'subFields' in field">
      <Table>
        <TableCaption>Subfields</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[30%]">name</TableHead>
            <TableHead class="w-[30%]">id</TableHead>
            <TableHead class="w-[40%]">parsedValue</TableHead>
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
