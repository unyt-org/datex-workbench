<script setup lang="ts">
import Separator from '@/components/ui/separator/Separator.vue';
import type { ParsedField } from '@unyt/speck';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  infoData: ParsedField & { color: string };
}>();
</script>

<template>
  <!-- The basic data like name, id, description and parsed Value with headers and as regular text
  only the subfields as a table like I did but columns and rows reversed
  incooperate category color in some way
  -->
  <h3>Version</h3>
  <h4>id: </h4>
  <p>description</p>
  <!-- x-Button top right to get rid of Info box as well as clicking the field a second time also gets rid of info box -->

  <!-- keep fields greyed out when viewing info in bottom view -->

  <!-- add tooltip when hovering over a byte containing the name of the field and the
   absolut byte offset of the whole block and where the field starts and ends as byte offset -->

  <Table>
    <TableBody>
      <TableRow>
        <TableCell class="w-[20%]">name</TableCell>
        <TableCell class="w-[20%]"></TableCell>
        <TableCell>{{ infoData.name }}</TableCell>
      </TableRow>
      <TableRow v-if="'id' in infoData">
        <TableCell>id</TableCell>
        <TableCell></TableCell>
        <TableCell>{{ infoData.id }}</TableCell>
      </TableRow>
      <TableRow v-if="'parsedValue' in infoData">
        <TableCell>parsed value</TableCell>
        <TableCell></TableCell>
        <TableCell>{{ infoData.parsedValue }}</TableCell>
      </TableRow>
      <div v-if="'subFields' in infoData" class="contents">
        <div v-for="(subField, i) in infoData.subFields" :key="i" class="contents">
          <TableRow></TableRow>
          <TableRow>
            <TableCell>subField {{ i + 1 }}</TableCell>
            <TableCell>name</TableCell>
            <TableCell>{{ subField.name }}</TableCell>
          </TableRow>
          <TableRow v-if="'id' in subField">
            <TableCell></TableCell>
            <TableCell>id</TableCell>
            <TableCell>{{ subField.id }}</TableCell>
          </TableRow>
          <TableRow v-if="'parsedValue' in subField">
            <TableCell></TableCell>
            <TableCell>parsed value</TableCell>
            <TableCell>{{ subField.parsedValue }}</TableCell>
          </TableRow>
        </div>
      </div>
    </TableBody>
  </Table>

  <!-- <div class="info-grid grid gap-1">
    <div class="contents">
      <div class="col-span-2">name</div>
      <div class="break-all">{{ infoData.name }}</div>
    </div>
    <div v-if="'id' in infoData" class="contents">
      <Separator class="col-span-full" />
      <div class="col-span-2">id</div>
      <div class="break-all">{{ infoData.id }}</div>
    </div>
    <div v-if="'parsedValue' in infoData" class="contents">
      <Separator class="col-span-full" />
      <div class="col-span-2">parsed value</div>
      <div class="break-all">{{ infoData.parsedValue }}</div>
    </div>
    <div v-if="'subFields' in infoData" class="contents">
      <Separator class="col-span-full" />
      <div>subfields</div>
      <div class="col-span-2 grid grid-cols-subgrid">
        <div v-for="(subField, i) in infoData.subFields" :key="i" class="contents">
          <div class="contents">
            <div>name</div>
            <div class="break-all">{{ subField.name }}</div>
            <Separator class="col-span-full" />
          </div>
          <div v-if="'id' in subField" class="contents">
            <div>id</div>
            <div class="break-all">{{ subField.id }}</div>
            <Separator class="col-span-full" />
          </div>
          <div v-if="'parsedValue' in subField" class="contents">
            <div>parsed Value</div>
            <div class="break-all">{{ subField.parsedValue }}</div>
            <Separator class="col-span-full" />
          </div>
          <div class="col-span-full h-4"></div>
        </div>
      </div>
    </div>
  </div> -->
</template>

<style scoped>
.info-grid {
  grid-template-columns: 1fr 1fr 3fr;
}
</style>
