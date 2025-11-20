<script setup lang="ts">
import { TYPE_CONFIGS, getTypeName, extractPointerId } from '@/lib/pointer-types';
import type { DIF } from '@unyt/datex';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import { computed } from 'vue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PointerRefInline from './PointerRefInline.vue';

// Props
interface PointerTreeItemProps {
  nodeId: string;
  label: string;
  value: DIF.Definitions.DIFContainer;
  expandedNodes: Set<string>;
  visitedObjects?: WeakSet<object>;
  showFullIds?: boolean;
  showDataTypes?: boolean;
  showIndices?: boolean;
  hideTypeHintsForPrimitives?: boolean;
  hideMapKeyTypeHintsForPrimitives?: boolean;
  depth?: number;
  parentIsMap?: boolean; // Track if parent is a map
  keyContainer?: DIF.Definitions.DIFValueContainer; // The original DIF container for the key (for type hints)
  selectedPointerId?: string | null; // For highlighting navigated pointer
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

// Emits
const emit = defineEmits<{
  'node-click': [nodeId: string, value: DIF.Definitions.DIFContainer];
  'node-toggle': [nodeId: string];
  'id-click': [nodeId: string];
  'pointer-ref-click': [pointerId: string];
}>();

// Check if value is circular reference
function isCircularReference(difContainer: DIF.Definitions.DIFContainer): boolean {
  // Only objects can have circular references
  if (typeof difContainer !== 'object' || difContainer === null) {
    return false;
  }

  return props.visitedObjects?.has(difContainer) ?? false;
}

// Check if expandable
function isExpandable(difContainer: DIF.Definitions.DIFContainer): boolean {
  const typeName = getTypeName(difContainer);
  return TYPE_CONFIGS[typeName]?.isExpandable ?? false;
}

// Extract the actual value from a DIF container, unwrapping nested value properties
function extractValue(difContainer: DIF.Definitions.DIFContainer): unknown {
  if (difContainer && typeof difContainer === 'object' && 'value' in difContainer) {
    return (difContainer as Record<string, unknown>).value;
  }
  return difContainer;
}

// Get value preview
function getValuePreview(difContainer: DIF.Definitions.DIFContainer): string {
  const value = extractValue(difContainer);
  const typeName = getTypeName(difContainer);

  // Build the preview string
  let preview = '';

  // Determine if we should show type hint
  const shouldShowTypeHint =
    props.showDataTypes &&
    !(
      props.hideTypeHintsForPrimitives &&
      (typeName === 'integer' ||
        typeName === 'decimal' ||
        typeName === 'boolean' ||
        typeName === 'text')
    );

  // Add data type if conditions are met
  if (shouldShowTypeHint) {
    preview = `${typeName} = `;
  }

  // For non-expandable types, show the actual value
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

// Get children
function getChildren(
  difContainer: DIF.Definitions.DIFContainer,
): Array<[string, DIF.Definitions.DIFValueContainer, DIF.Definitions.DIFValueContainer?]> {
  // Only compute children if node is expanded (lazy evaluation)
  if (!expanded.value) {
    return [];
  }

  // Check for circular reference before processing children
  if (isCircularReference(difContainer)) {
    return [];
  }

  // Check if it's a DIF map type (type: '0c0000')
  if (
    typeof difContainer === 'object' &&
    difContainer !== null &&
    'type' in difContainer &&
    difContainer.type === '0c0000'
  ) {
    const value = extractValue(difContainer);
    
    // DIF maps can be stored as an array of [key, value] tuples (DIFMap format)
    if (Array.isArray(value)) {
      return (value as DIF.Definitions.DIFMap).map(([keyContainer, valueContainer]) => {
        // Extract the display value for the key
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
      });
    }
    
    // DIF maps can also be stored as an object with key-value pairs
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v]) => {
        // Create a DIFValueContainer for the key
        // Try to infer the actual type from the key string
        let keyValue: string | number | boolean = k;
        
        // Try to parse as number
        if (!isNaN(Number(k)) && k.trim() !== '') {
          keyValue = Number(k);
        }
        // Try to parse as boolean
        else if (k === 'true' || k === 'false') {
          keyValue = k === 'true';
        }
        
        // Create container with the properly typed value
        // getTypeName() will infer the correct type from the value
        const keyContainer: DIF.Definitions.DIFValueContainer = { value: keyValue };
        return [k, v as DIF.Definitions.DIFValueContainer, keyContainer];
      });
    }
  }

  const value = extractValue(difContainer);

  if (Array.isArray(value)) {
    return (value as DIF.Definitions.DIFArray).map((item: DIF.Definitions.DIFValueContainer, index: number) => [String(index), item, undefined]);
  }

  if (value instanceof Map) {
    return Array.from((value as Map<unknown, DIF.Definitions.DIFValueContainer>).entries()).map(([k, v]) => {
      const keyDisplay =
        typeof k === 'string'
          ? k
          : typeof k === 'number'
            ? String(k)
            : typeof k === 'object'
              ? JSON.stringify(k)
              : String(k);
      return [keyDisplay, v, k as DIF.Definitions.DIFValueContainer];
    });
  }
  
  // Handle plain JavaScript objects
  if (typeof difContainer === 'object' &&
      difContainer !== null &&
      !Array.isArray(difContainer) &&
      !('type' in difContainer)) {
    return Object.entries(difContainer).map(([key, val]) => {
      const keyContainer = { value: key } as DIF.Definitions.DIFValueContainer;
      return [
        key,
        val as DIF.Definitions.DIFContainer,
        keyContainer,
      ];
    });
  }

  return [];
}

// Computed children list (cached and only recomputes when expanded or value changes)
const children = computed(() => getChildren(props.value));

// Create new visited set for children (includes current value)
const childVisitedObjects = computed(() => {
  const newVisited = new WeakSet<object>();
  if (typeof props.value === 'object' && props.value !== null) {
    newVisited.add(props.value);
  }
  return newVisited;
});

// Generate child ID
function getChildId(parentId: string, childKey: string): string {
  return `${parentId}.${childKey}`;
}

// Get the type hint for a key (used for map keys)
function getKeyTypeHint(keyContainer?: DIF.Definitions.DIFValueContainer): string {
  if (!keyContainer || !props.showDataTypes) {
    return '';
  }

  const typeName = getTypeName(keyContainer);

  // Apply the same logic for hiding type hints for primitives, but using the map key preference
  const shouldShowTypeHint = !(
    props.hideMapKeyTypeHintsForPrimitives &&
    (typeName === 'integer' ||
      typeName === 'decimal' ||
      typeName === 'boolean' ||
      typeName === 'text')
  );

  return shouldShowTypeHint ? typeName : '';
}

// Get tooltip content for keys
function getKeyTooltip(keyContainer?: DIF.Definitions.DIFValueContainer): string {
  if (!keyContainer) return '';
  const typeName = getTypeName(keyContainer);
  return `Key Type: ${typeName}`;
}

// Get tooltip content for values
function getValueTooltip(valueContainer: DIF.Definitions.DIFContainer): string {
  const typeName = getTypeName(valueContainer);
  const parts: string[] = [`Type: ${typeName}`];
  
  // Add pointer ID if it's a pointer address (string format like $0000000000000001)
  if (typeof valueContainer === 'string' && valueContainer.startsWith('$')) {
    parts.push(`Pointer: ${valueContainer}`);
  }
  
  return parts.join('\n');
}

// Computed
const expanded = computed(() => props.expandedNodes.has(props.nodeId));

// Check if current value is circular
const isCircular = computed(() => isCircularReference(props.value));

// Check if current value is a map (so we can pass this info to children)
const isMap = computed(() => {
  const typeName = getTypeName(props.value);
  return typeName === 'map';
});

// Methods
function toggleExpanded(event?: Event) {
  if (event) {
    event.stopPropagation();
  }
  emit('node-toggle', props.nodeId);
}

function handleClick() {
  // Click on the row toggles expansion if expandable
  if (isExpandable(props.value)) {
    toggleExpanded();
  } else {
    emit('node-click', props.nodeId, props.value);
  }
}
</script>

<template>
  <div v-memo="[expanded, label, showDataTypes, showIndices, hideTypeHintsForPrimitives, hideMapKeyTypeHintsForPrimitives, selectedPointerId]">
    <!-- This node -->
    <div
      :id="`pointer-node-${nodeId}`"
      class="flex items-center gap-1 px-1 py-2 hover:bg-accent cursor-pointer rounded-md transition-all"
      :class="{
        'hover:bg-accent/50': depth > 0,
        'bg-primary/20 ring-2 ring-primary': selectedPointerId === nodeId
      }"
      @click="handleClick"
    >
      <!-- Expand/Collapse chevron -->
      <button
        v-if="isExpandable(value)"
        @click="toggleExpanded"
        class="shrink-0 hover:bg-accent-foreground/10 rounded p-0.5"
      >
        <ChevronRight v-if="!expanded" :class="depth === 0 ? 'h-4 w-4' : 'h-3 w-3'" />
        <ChevronDown v-else :class="depth === 0 ? 'h-4 w-4' : 'h-3 w-3'" />
      </button>
      <div v-else :class="depth === 0 ? 'w-5' : 'w-4'" class="shrink-0"></div>

      <!-- Content -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- For top-level pointers (depth 0): show pointer ID in blue -->
        <TooltipProvider v-if="depth === 0" :delay-duration="300">
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="font-mono text-sm unyt-blue font-semibold">
                {{ label }}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-xs">{{ nodeId }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <!-- For nested items (depth > 0): show key -->
        <!-- Always show keys for map entries, only show for arrays/lists if showIndices is true -->
        <TooltipProvider v-if="depth > 0 && (parentIsMap || showIndices)" :delay-duration="300">
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="text-sm font-medium">
                <!-- Show key type hint if available -->
                <span v-if="keyContainer && showDataTypes && getKeyTypeHint(keyContainer)" class="text-foreground/50">
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

        <!-- Show circular reference indicator -->
        <span v-if="isCircular" class="text-sm text-amber-500 italic"> [Circular Reference] </span>

        <!-- Show pointer reference as clickable chip -->
        <PointerRefInline
          v-else-if="extractPointerId(value)"
          :pointer-id="extractPointerId(value)!"
          @click="emit('pointer-ref-click', extractPointerId(value)!)"
        />

        <!-- Show type-based preview or opening bracket when expanded -->
        <TooltipProvider v-else-if="!expanded || depth === 0" :delay-duration="300">
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="text-sm text-foreground/70 truncate">
                {{ getValuePreview(value) }}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-xs whitespace-pre-line">{{ getValueTooltip(value) }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span v-else-if="isExpandable(value)" class="text-sm text-foreground/70">
          {{ getTypeName(value) === 'list' ? '[' : '{' }}
        </span>
      </div>
    </div>

    <!-- Children (RECURSIVE - this component calls itself!) -->
    <div
      v-if="expanded && isExpandable(value) && !isCircular"
      class="ml-6 border-l border-border pl-1"
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
      />

      <!-- Closing bracket -->
      <div class="px-1 py-2 text-sm text-foreground/70">
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
