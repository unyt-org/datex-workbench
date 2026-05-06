<script setup lang="ts">
import type { ParsedStructure, ParsedValue, StructureDefinition } from '@unyt/speck';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHeader,
    TableHead,
} from '@/components/ui/table';
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
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
        return `${value}`;
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
    <div
        v-if="field"
        class="*:bg-card text-foreground overflow-y-auto flex flex-col"
    >
        <div class="flex items-center justify-start border-b px-4 font-medium">
            <div class="grow py-5 has-[p]:pb-1">
                <div class="text-lg">
                    {{ field.name }}
                </div>
                <div class="text-sm" :style="{ color: getColor(fieldDef) }">{{ fieldDef?.category }}</div>
                <p v-if="'id' in field" class="text-xs">id: {{ field.id }}</p>
            </div>
            <X class="hover:text-muted-foreground size-4 cursor-pointer" @click="closeInfo" />
        </div>
        <div v-if="'parsedValue' in field" class="px-4 py-2 text-base">
            Value: {{ renderParsedValue(field.parsedValue) }}
        </div>
        <!-- <p>if possible, description</p> -->
        <div v-if="'subFields' in field" class="text-muted-foreground">
            <Table class="text-base">
                <!-- <TableCaption>Subfields</TableCaption> -->
                <TableHeader>
                    <TableRow>
                        <TableHead class="text-foreground">name</TableHead>
                        <TableHead class="text-foreground" v-if="showSubfieldId">id</TableHead>
                        <TableHead class="text-foreground">value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="(subField, i) in field.subFields" :key="i">
                        <TableCell class="w-1/3 min-w-max whitespace-nowrap">{{
                            subField.name
                        }}</TableCell>
                        <TableCell
                            v-if="showSubfieldId"
                            class="w-1/3"
                            :class="'id' in subField ? '' : 'brightness-50'"
                            >{{ 'id' in subField ? subField.id : '-' }}</TableCell
                        >
                        <TableCell
                            class="w-2/3 break-all"
                            :class="{ 'w-1/3': showSubfieldId, 'w-2/3': !showSubfieldId }"
                            >{{
                                'parsedValue' in subField
                                    ? renderParsedValue(subField.parsedValue)
                                    : '-'
                            }}</TableCell
                        >
                    </TableRow>
                </TableBody>
            </Table>
        </div>
        <div class="flex-1 bg-card" />
    </div>
</template>
