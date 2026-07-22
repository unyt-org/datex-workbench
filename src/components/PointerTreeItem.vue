<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TYPE_CONFIGS, extractPointerId, getTypeName } from '@/lib/pointer-types';
import type { DIF } from '@unyt/datex';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PointerRefInline from './PointerRefInline.vue';

// Props
interface PointerTreeItemProps {
    nodeId: string;
    label: string;
    value: DIF.Definitions.DIFValueContainer;
    expandedNodes: Set<string>;
    visitedObjects?: WeakSet<object>;
    showFullIds?: boolean;
    showDataTypes?: boolean;
    showIndices?: boolean;
    hideTypeHintsForPrimitives?: boolean;
    hideMapKeyTypeHintsForPrimitives?: boolean;
    depth?: number;
    parentIsMap?: boolean;
    keyContainer?: DIF.Definitions.DIFValueContainer;
    selectedPointerId?: string | null;
}

const props = withDefaults(defineProps<PointerTreeItemProps>(), {
    depth: 0,
    showFullIds: false,
    showDataTypes: false,
    showIndices: true,
    hideTypeHintsForPrimitives: true,
    hideMapKeyTypeHintsForPrimitives: true,
    visitedObjects: () => new WeakSet(),
    parentIsMap: false,
    selectedPointerId: null,
});

const { t } = useI18n();

const emit = defineEmits<{
    'node-click': [nodeId: string, value: DIF.Definitions.DIFValueContainer];
    'node-toggle': [nodeId: string];
    'id-click': [nodeId: string];
    'pointer-ref-click': [pointerId: string];
    'value-update': [nodeId: string, newValue: unknown];
}>();

const isEditing = ref(false);
const editValue = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

function isCircularReference(difValueContainer: DIF.Definitions.DIFValueContainer): boolean {
    if (typeof difValueContainer !== 'object' || difValueContainer === null) {
        return false;
    }
    return props.visitedObjects?.has(difValueContainer) ?? false;
}

function isExpandable(difValueContainer: DIF.Definitions.DIFValueContainer): boolean {
    const typeName = getTypeName(difValueContainer);
    return TYPE_CONFIGS[typeName]?.isExpandable ?? false;
}

function extractValue(difValueContainer: DIF.Definitions.DIFValueContainer): unknown {
    if (
        difValueContainer &&
        typeof difValueContainer === 'object' &&
        'value' in difValueContainer
    ) {
        return (difValueContainer as Record<string, unknown>).value;
    }
    return difValueContainer;
}

function getValuePreview(difValueContainer: DIF.Definitions.DIFValueContainer): string {
    const value = extractValue(difValueContainer);
    const typeName = getTypeName(difValueContainer);

    let preview = '';

    const shouldShowTypeHint =
        props.showDataTypes &&
        !(
            props.hideTypeHintsForPrimitives &&
            (typeName === 'integer' ||
                typeName === 'decimal' ||
                typeName === 'boolean' ||
                typeName === 'text')
        );

    if (shouldShowTypeHint) {
        preview = `${typeName} = `;
    }

    if (!TYPE_CONFIGS[typeName]?.isExpandable) {
        if (typeName === 'text') preview += `"${value}"`;
        else if (typeName === 'boolean') preview += value ? 'true' : 'false';
        else if (typeName === 'integer' || typeName === 'decimal') preview += String(value);
        else if (typeName === 'null') preview += 'null';
        else preview += TYPE_CONFIGS[typeName]?.preview(value) || 'null';
    } else {
        preview += TYPE_CONFIGS[typeName]?.preview(value) || 'null';
    }

    return preview;
}

function getChildren(
    difValueContainer: DIF.Definitions.DIFValueContainer,
): Array<[string, DIF.Definitions.DIFValueContainer, DIF.Definitions.DIFValueContainer?]> {
    if (!expanded.value) {
        return [];
    }

    if (isCircularReference(difValueContainer)) {
        return [];
    }

    if (
        typeof difValueContainer === 'object' &&
        difValueContainer !== null &&
        'type' in difValueContainer &&
        difValueContainer.type === '0c0000'
    ) {
        const value = extractValue(difValueContainer);

        if (Array.isArray(value)) {
            // @ts-expect-error --- fixme
            return (value as DIF.Definitions.DIFMapTypeDefinition).map(
                ([keyContainer, valueContainer]) => {
                    // @ts-expect-error --- fixme
                    const keyValue = extractValue(keyContainer);
                    const keyDisplay =
                        typeof keyValue === 'string'
                            ? keyValue
                            : typeof keyValue === 'number'
                              ? String(keyValue)
                              : typeof keyValue === 'boolean'
                                ? String(keyValue)
                                : JSON.stringify(keyValue);
                    return [keyDisplay, valueContainer, keyContainer];
                },
            );
        }

        if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([k, v]) => {
                let keyValue: string | number | boolean = k;

                if (!isNaN(Number(k)) && k.trim() !== '') {
                    keyValue = Number(k);
                } else if (k === 'true' || k === 'false') {
                    keyValue = k === 'true';
                }

                // @ts-expect-error --- fixme
                const keyContainer: DIF.Definitions.DIFValueContainer = { value: keyValue };
                return [k, v as DIF.Definitions.DIFValueContainer, keyContainer];
            });
        }
    }

    const value = extractValue(difValueContainer);

    if (Array.isArray(value)) {
        // @ts-expect-error --- fixme
        return (value as DIF.Definitions.DIFListTypeDefinition).map(
            (item: DIF.Definitions.DIFType, index: number) => [String(index), item, undefined],
        );
    }

    if (value instanceof Map) {
        return Array.from((value as Map<unknown, DIF.Definitions.DIFValueContainer>).entries()).map(
            ([k, v]) => {
                const keyDisplay =
                    typeof k === 'string'
                        ? k
                        : typeof k === 'number'
                          ? String(k)
                          : typeof k === 'object'
                            ? JSON.stringify(k)
                            : String(k);
                return [keyDisplay, v, k as DIF.Definitions.DIFValueContainer];
            },
        );
    }

    if (
        typeof difValueContainer === 'object' &&
        difValueContainer !== null &&
        !Array.isArray(difValueContainer) &&
        !('type' in difValueContainer)
    ) {
        return Object.entries(difValueContainer).map(([key, val]) => {
            // @ts-expect-error --- fixme
            const keyContainer = { value: key } as DIF.Definitions.DIFValueContainer;
            return [key, val as DIF.Definitions.DIFValueContainer, keyContainer];
        });
    }

    return [];
}

const children = computed(() => getChildren(props.value));

const childVisitedObjects = computed(() => {
    const newVisited = new WeakSet<object>();
    if (typeof props.value === 'object' && props.value !== null) {
        newVisited.add(props.value);
    }
    return newVisited;
});

function getChildId(parentId: string, childKey: string): string {
    return `${parentId}.${childKey}`;
}

function getKeyTypeHint(keyContainer?: DIF.Definitions.DIFValueContainer): string {
    if (!keyContainer || !props.showDataTypes) {
        return '';
    }

    const typeName = getTypeName(keyContainer);

    const shouldShowTypeHint = !(
        props.hideMapKeyTypeHintsForPrimitives &&
        (typeName === 'integer' ||
            typeName === 'decimal' ||
            typeName === 'boolean' ||
            typeName === 'text')
    );

    return shouldShowTypeHint ? typeName : '';
}

function getKeyTooltip(keyContainer?: DIF.Definitions.DIFValueContainer): string {
    if (!keyContainer) return '';
    const typeName = getTypeName(keyContainer);
    return `${t('pointer.keyType')}: ${typeName}`;
}

function getValueTooltip(valueContainer: DIF.Definitions.DIFValueContainer): string {
    const typeName = getTypeName(valueContainer);
    const parts: string[] = [`${t('common.type')}: ${typeName}`];

    if (typeof valueContainer === 'string' && valueContainer.startsWith('$')) {
        parts.push(`${t('pointer.pointer')}: ${valueContainer}`);
    }

    return parts.join('\n');
}

const expanded = computed(() => props.expandedNodes.has(props.nodeId));

const isCircular = computed(() => isCircularReference(props.value));

const isMap = computed(() => {
    const typeName = getTypeName(props.value);
    return typeName === 'map';
});

function toggleExpanded(event?: Event) {
    if (event) {
        event.stopPropagation();
    }
    emit('node-toggle', props.nodeId);
}

function handleClick() {
    if (isExpandable(props.value)) {
        toggleExpanded();
    } else {
        emit('node-click', props.nodeId, props.value);
    }
}

function startEditing() {
    if (isExpandable(props.value) || extractPointerId(props.value) || isCircular.value) {
        return;
    }

    const value = extractValue(props.value);
    const typeName = getTypeName(props.value);

    if (typeName === 'text') {
        editValue.value = String(value);
    } else if (typeName === 'boolean') {
        editValue.value = value ? 'true' : 'false';
    } else if (typeName === 'integer' || typeName === 'decimal') {
        editValue.value = String(value);
    } else if (typeName === 'null') {
        editValue.value = 'null';
    } else {
        return;
    }

    isEditing.value = true;

    nextTick(() => {
        if (editInputRef.value) {
            editInputRef.value.focus();
            editInputRef.value.select();
        }
    });
}

function saveEdit() {
    if (!isEditing.value) return;

    const typeName = getTypeName(props.value);
    let newValue: unknown;

    try {
        if (typeName === 'text') {
            newValue = editValue.value;
        } else if (typeName === 'boolean') {
            const lower = editValue.value.toLowerCase();
            if (lower === 'true') newValue = true;
            else if (lower === 'false') newValue = false;
            else throw new Error('Invalid boolean value');
        } else if (typeName === 'integer') {
            newValue = parseInt(editValue.value, 10);
            if (isNaN(newValue as number)) throw new Error('Invalid integer');
        } else if (typeName === 'decimal') {
            newValue = parseFloat(editValue.value);
            if (isNaN(newValue as number)) throw new Error('Invalid number');
        } else if (typeName === 'null') {
            if (editValue.value.toLowerCase() === 'null') {
                newValue = null;
            } else {
                throw new Error('Invalid null value');
            }
        } else {
            throw new Error('Unsupported type for editing');
        }

        emit('value-update', props.nodeId, newValue);
        isEditing.value = false;
    } catch {
        cancelEdit();
    }
}

function cancelEdit() {
    isEditing.value = false;
    editValue.value = '';
}

function handleEditKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveEdit();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelEdit();
    }
}
</script>

<template>
    <div
        v-memo="[
            expanded,
            label,
            showDataTypes,
            showIndices,
            hideTypeHintsForPrimitives,
            hideMapKeyTypeHintsForPrimitives,
            selectedPointerId,
        ]"
    >
        <!-- This node -->
        <div
            :id="`pointer-node-${nodeId}`"
            class="hover:bg-accent flex cursor-pointer items-center gap-1 rounded-md px-1 py-2 transition-all"
            :class="{
                'hover:bg-accent/50': depth > 0,
                'bg-primary/20 ring-primary ring-2': selectedPointerId === nodeId,
            }"
            @click="handleClick"
        >
            <button
                v-if="isExpandable(value)"
                @click="toggleExpanded"
                class="hover:bg-accent-foreground/10 shrink-0 rounded p-0.5"
            >
                <ChevronRight v-if="!expanded" :class="depth === 0 ? 'h-4 w-4' : 'h-3 w-3'" />
                <ChevronDown v-else :class="depth === 0 ? 'h-4 w-4' : 'h-3 w-3'" />
            </button>
            <div v-else :class="depth === 0 ? 'w-5' : 'w-4'" class="shrink-0"></div>

            <div class="flex min-w-0 flex-1 items-center gap-2">
                <TooltipProvider v-if="depth === 0" :delay-duration="300">
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <span class="unyt-blue font-mono text-sm font-semibold">
                                {{ label }}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p class="text-xs">{{ nodeId }}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider
                    v-if="depth > 0 && (parentIsMap || showIndices)"
                    :delay-duration="300"
                >
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <span class="text-sm font-medium">
                                <span
                                    v-if="
                                        keyContainer &&
                                        showDataTypes &&
                                        getKeyTypeHint(keyContainer)
                                    "
                                    class="text-foreground/50"
                                >
                                    {{ getKeyTypeHint(keyContainer) }}:
                                </span>
                                {{ label }}:
                            </span>
                        </TooltipTrigger>
                        <TooltipContent v-if="keyContainer">
                            <p class="text-xs">{{ getKeyTooltip(keyContainer) }}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <span v-if="isCircular" class="text-sm text-amber-500 italic">
                    {{ t('pointer.circularReference') }}
                </span>

                <PointerRefInline
                    v-else-if="extractPointerId(value)"
                    :pointer-id="extractPointerId(value)!"
                    @click="emit('pointer-ref-click', extractPointerId(value)!)"
                />

                <TooltipProvider v-else-if="!expanded || depth === 0" :delay-duration="300">
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <div v-if="isEditing" @click.stop class="flex-1">
                                <input
                                    ref="editInputRef"
                                    v-model="editValue"
                                    @blur="saveEdit"
                                    @keydown="handleEditKeydown"
                                    class="bg-background border-primary focus:ring-primary w-full rounded border px-1 py-0.5 text-sm focus:ring-1 focus:outline-none"
                                />
                            </div>
                            <span
                                v-else
                                @dblclick.stop="startEditing"
                                class="text-foreground/70 hover:bg-accent/30 cursor-text truncate rounded px-1 text-sm transition-colors"
                            >
                                {{ getValuePreview(value) }}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p class="text-xs whitespace-pre-line">{{ getValueTooltip(value) }}</p>
                            <p class="text-muted-foreground mt-1 text-xs">
                                {{ t('pointer.doubleClickToEdit') }}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <span v-else-if="isExpandable(value)" class="text-foreground/70 text-sm">
                    {{ getTypeName(value) === 'list' ? '[' : '{' }}
                </span>
            </div>
        </div>

        <div
            v-if="expanded && isExpandable(value) && !isCircular"
            class="border-border ml-6 border-l pl-1"
        >
            <PointerTreeItem
                v-for="[childKey, childValue, childKeyContainer] in children"
                :key="childKey"
                :node-id="getChildId(nodeId, childKey)"
                :label="childKey"
                :value="childValue"
                :expanded-nodes="expandedNodes"
                :visited-objects="childVisitedObjects"
                :show-full-ids="showFullIds"
                :show-data-types="showDataTypes"
                :show-indices="showIndices"
                :hide-type-hints-for-primitives="hideTypeHintsForPrimitives"
                :hide-map-key-type-hints-for-primitives="hideMapKeyTypeHintsForPrimitives"
                :parent-is-map="isMap"
                :key-container="childKeyContainer"
                :selected-pointer-id="selectedPointerId"
                :depth="depth + 1"
                @node-click="emit('node-click', $event, childValue)"
                @node-toggle="emit('node-toggle', $event)"
                @pointer-ref-click="emit('pointer-ref-click', $event)"
                @value-update="emit('value-update', $event, $event)"
            />

            <div class="text-foreground/70 px-1 py-2 text-sm">
                {{ getTypeName(value) === 'list' ? ']' : '}' }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.unyt-blue {
    color: rgb(42, 170, 215);
}
</style>
