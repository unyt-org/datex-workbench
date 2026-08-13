<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
import type { ParsedField, ParsedSection, SectionDefinition } from '@unyt/speck';
import BlockFieldWrapper from './BlockFieldWrapper.vue';
import type { Span } from '@/lib/_temp_types.ts';

const props = defineProps<{
    section: ParsedSection;
    sectionDef: SectionDefinition;
    sectionId: number;
    selectedField: FieldIdentifier | null;
    highlightedSpan: Span | null;
}>();

const emit = defineEmits(['section-field-clicked']);
function handleFieldClick(data: FieldIdentifier | null) {
    emit('section-field-clicked', data);
}

function findFieldDef(field: ParsedField) {
    const fi = props.sectionDef.fields.find((fieldDef) => fieldDef.name === field.name);
    if (fi === undefined) {
        throw new Error(`Field definition not found for field name: ${field.name}`);
    }
    return fi;
}

function shouldGrayOutField(fieldIndex: number): boolean {
    if (!props.highlightedSpan) return false;
    return fieldIndex < props.highlightedSpan.start || fieldIndex >= props.highlightedSpan.end;
}

function fieldsWithByteOffset(fields: ParsedField[]): { field: ParsedField; byteOffset: number }[] {
    const result: { field: ParsedField; byteOffset: number }[] = [];
    let currentByteOffset = 0;

    for (const field of fields) {
        result.push({ field, byteOffset: currentByteOffset });
        currentByteOffset += field.bytes.length;
    }

    return result;
}

function findField(fieldIdentifier: FieldIdentifier | null): ParsedField | null {
    if (!fieldIdentifier) return null;
    const section = props.section;
    if (fieldIdentifier.sectionIndex !== props.sectionId) return null;
    const field = section.fields[fieldIdentifier.fieldIndex];
    return field || null;
}

</script>

<template>
    <div class="text-foreground font-mono">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, 3ch)">
            <div
                v-for="({ field, byteOffset }, index) in fieldsWithByteOffset(section.fields)"
                :key="index"
                class="contents"
                :class="{
                    'selected-field':
                        selectedField &&
                        sectionId === selectedField.sectionIndex &&
                        (index === selectedField.fieldIndex || findField(selectedField)?.name === field.name),
                }"
            >
                <BlockFieldWrapper
                    :field="field"
                    :fieldDef="findFieldDef(field)"
                    :sectionId="sectionId"
                    :fieldId="index"
                    :selectedField="selectedField"
                    :highlightedSpan="highlightedSpan"
                    :gray-out="shouldGrayOutField(byteOffset)"
                    @field-clicked="handleFieldClick"
                />
            </div>
        </div>
    </div>
</template>
