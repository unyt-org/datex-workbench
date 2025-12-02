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
import type { FieldIdentifier } from '@/types/BlockViewer/blockProtocolView';
import { computed } from 'vue';
import Separator from '@/components/ui/separator/Separator.vue';
import { X } from 'lucide-vue-next';
import { showSubfieldId } from '@/views/BlockViewer/settings';

const props = defineProps<{
  structure: ParsedStructure;
  structureDef: StructureDefinition | undefined;
  selectedField: FieldIdentifier;
}>();

const emit = defineEmits(['close-button-clicked']);
function closeInfo() {
  emit('close-button-clicked');
}

const field = computed(
  () => props.structure[props.selectedField.sectionIndex]?.fields[props.selectedField.fieldIndex],
);
</script>

<template>
  <div v-if="field" class="contents">
    <div class="px-4">
      <div class="text-foreground text-md flex flex-1 items-center justify-between font-medium">
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
            <TableHead class="w-1/3">name</TableHead>
            <TableHead v-if="showSubfieldId" class="w-1/3">id</TableHead>
            <TableHead class="w-2/3" :class="{ 'w-1/3': showSubfieldId, 'w-2/3': !showSubfieldId }"
              >value</TableHead
            >
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(subField, i) in field.subFields" :key="i">
            <TableCell>{{ subField.name }}</TableCell>
            <TableCell v-if="showSubfieldId">{{ 'id' in subField ? subField.id : '-' }}</TableCell>
            <TableCell class="break-all">{{
              'parsedValue' in subField ? subField.parsedValue : '-'
            }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
