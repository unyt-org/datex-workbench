<script setup lang="ts">
import type { FieldDefinition, ParsedField } from '@unyt/speck';
import { getColor } from '@/views/BlockViewer/settings';
// import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  field: ParsedField;
  shortenWithDots: boolean;
  fieldDef: FieldDefinition | undefined;
}>();

function byteToHexString(b: number): string {
  return b.toString(16).padStart(2, '0');
}
</script>

<template>
  <!-- <TooltipProvider>
    <div class="field-styling contents">
      <div v-for="(byte, indexInner) in field.bytes" :key="indexInner">
        <Tooltip>
          <TooltipTrigger
            class="byte-wrapper"
            :style="{ backgroundColor: getColor(fieldDef?.category) }"
            >{{ byteToHexString(byte) }}</TooltipTrigger
          >
          <TooltipContent>
            <p>{{ field.name }}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div v-if="shortenWithDots">
        <Tooltip>
          <TooltipTrigger
            class="byte-wrapper"
            :style="{ backgroundColor: getColor(fieldDef?.category) }"
            >..</TooltipTrigger
          >
          <TooltipContent>
            <p>{{ field.name }}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  </TooltipProvider> -->

  <div class="field-styling contents">
    <div v-for="(byte, indexInner) in field.bytes" :key="indexInner">
      <div
        class="byte-wrapper leading-tight"
        :style="{ backgroundColor: getColor(fieldDef?.category) }"
      >
        {{ byteToHexString(byte) }}
      </div>
    </div>
    <div v-if="shortenWithDots">
      <div
        class="byte-wrapper leading-tight"
        :style="{ backgroundColor: getColor(fieldDef?.category) }"
      >
        ..
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-styling {
  --total-column-width: 3ch;
  --column-gap: 0.3ch;
  --byte-field-radius: var(--radius-xs);

  font-family: mono;

  div {
    padding: calc(var(--column-gap) / 2) 0ch;
  }

  div:first-child {
    padding-left: calc(var(--column-gap) / 2);

    .byte-wrapper {
      padding-left: calc((var(--total-column-width) - 2ch - var(--column-gap)) / 2);
      border-bottom-left-radius: var(--byte-field-radius);
      border-top-left-radius: var(--byte-field-radius);
    }
  }

  :not(div:first-child) {
    .byte-wrapper {
      padding-left: calc((var(--total-column-width) - 2ch) / 2);
    }
  }

  div:last-child {
    padding-right: calc(var(--column-gap) / 2);

    .byte-wrapper {
      padding-right: calc((var(--total-column-width) - 2ch - var(--column-gap)) / 2);
      border-bottom-right-radius: var(--byte-field-radius);
      border-top-right-radius: var(--byte-field-radius);
    }
  }

  :not(div:last-child) {
    .byte-wrapper {
      padding-right: calc((var(--total-column-width) - 2ch) / 2);
    }
  }
}
</style>
