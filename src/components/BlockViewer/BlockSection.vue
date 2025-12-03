<script setup lang="ts">
import type { FieldIdentifier } from '@/types/BlockViewer/FieldIdentifier';
import type { ParsedField, ParsedSection, SectionDefinition } from '@unyt/speck';
import BlockFieldWrapper from './BlockFieldWrapper.vue';

const props = defineProps<{
    section: ParsedSection;
    sectionDef: SectionDefinition;
    sectionId: number;
    selectedField: FieldIdentifier | null;
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
</script>

<template>
    <div class="text-foreground font-mono">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, 3ch)">
            <div
                v-for="(field, index) in section.fields"
                :key="index"
                class="contents"
                :class="{
                    'selected-field':
                        selectedField &&
                        sectionId === selectedField.sectionIndex &&
                        index === selectedField.fieldIndex,
                }"
            >
                <BlockFieldWrapper
                    :field="field"
                    :fieldDef="findFieldDef(field)"
                    :sectionId="sectionId"
                    :fieldId="index"
                    :selectedField="selectedField"
                    @field-clicked="handleFieldClick"
                />
            </div>
        </div>
    </div>
</template>
