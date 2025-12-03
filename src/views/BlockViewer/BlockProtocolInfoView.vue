<script setup lang="ts">
import type { ParsedStructure, ParsedValue, StructureDefinition } from '@unyt/speck';
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
import { X } from 'lucide-vue-next';
import { showSubfieldId } from '@/views/BlockViewer/settings';
import { getColor } from '@/views/BlockViewer/settings';

const props = defineProps<{
  structure: ParsedStructure;
  structureDef: StructureDefinition;
  selectedField: FieldIdentifier;
}>();

const emit = defineEmits(['close-button-clicked']);
function closeInfo() {
  emit('close-button-clicked');
}

const field = computed(() => {
  if (!props.selectedField) {
    throw new Error(`InfoView is being rendered with undefined selectedField`);
  }
  const f =
    props.structure[props.selectedField.sectionIndex]?.fields[props.selectedField.fieldIndex];
  return f;
});

const fieldDef = computed(() => {
  if (!props.selectedField) {
    throw new Error(`InfoView is being rendered with undefined selectedField`);
  }
  const fd = props.structureDef.sections[props.selectedField.sectionIndex]?.fields.find(
    (fieldDef) => fieldDef.name === field.value?.name,
  );
  return fd;
});

// showing the bytes of the magic number not as js array, but also as hex or whatever.
// Like if there is a big string maybe we'll decide to cut it off later and only expand it on click?!
function renderParsedValue(value: ParsedValue): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }
  if (typeof value === 'string') {
    return `"${value}"`; // Wrap strings in quotes
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return 'Unknown type';
}
</script>

<template>
  <div v-if="field" class="bg-background mt-3 rounded-t-lg">
    <div class="px-4 pt-3">
      <div class="text-foreground text-md flex items-center justify-start gap-4 font-medium">
        <div
          class="size-14 shrink rounded-sm"
          :style="{ backgroundColor: getColor(fieldDef) }"
        ></div>
        <div class="h-14 grow rounded-sm px-2 py-4 has-[p]:pb-0">
          {{ field.name }}
          <p v-if="'id' in field" class="text-xs">id: {{ field.id }}</p>
        </div>
        <X
          class="hover:text-muted-foreground flex size-4 h-4 w-4 shrink-0 cursor-pointer items-center justify-center"
          @click="closeInfo"
        />
      </div>
      <!-- <Separator /> -->
      <p v-if="'parsedValue' in field" class="py-2 text-sm">
        Value: {{ renderParsedValue(field.parsedValue) }}
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
            <TableCell v-if="showSubfieldId" :class="'id' in subField ? '' : 'brightness-50'">{{
              'id' in subField ? subField.id : '-'
            }}</TableCell>
            <TableCell class="break-all">{{
              'parsedValue' in subField ? renderParsedValue(subField.parsedValue) : '-'
            }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
