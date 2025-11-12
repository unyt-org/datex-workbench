<script setup lang="ts">
import { ref } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  indexOuter: {
    type: Number,
    required: true,
  },
  fieldColor: {
    type: String,
    required: false,
  },
});

const bytesCutoff: number = 30;
const isExpanded = ref(false);

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');
</script>

<template>
  <div v-if="field.bytes.length <= bytesCutoff" class="field-wrapper contents">
    <div v-for="(byte, indexInner) in field.bytes" :key="indexInner">
      <div class="padding-wrapper" :style="{ backgroundColor: fieldColor }">
        {{ uint8ToHexString(byte) }}
      </div>
    </div>
  </div>
  <div v-else class="field-wrapper contents cursor-pointer" @click="isExpanded = !isExpanded">
    <div
      v-for="(byte, indexInner) in isExpanded ? field.bytes : field.bytes.slice(0, bytesCutoff)"
      :key="indexInner"
    >
      <div class="padding-wrapper" :style="{ backgroundColor: fieldColor }">
        {{ uint8ToHexString(byte) }}
      </div>
    </div>
    <div v-if="!isExpanded">
      <div class="padding-wrapper" :style="{ backgroundColor: fieldColor }">..</div>
    </div>
  </div>
</template>

<style>
.field-wrapper {
  div {
    padding: 0.25ch 0ch;
  }
  div:first-child {
    padding-left: 0.25ch;
    .padding-wrapper {
      padding-left: 0.5ch;
      border-bottom-left-radius: 0.5ch;
      border-top-left-radius: 0.5ch;
    }
  }
  :not(div:first-child) {
    .padding-wrapper {
      padding-left: 0.75ch;
    }
  }
  div:last-child {
    padding-right: 0.25ch;
    .padding-wrapper {
      padding-right: 0.5ch;
      border-bottom-right-radius: 0.5ch;
      border-top-right-radius: 0.5ch;
    }
  }
  :not(div:last-child) {
    .padding-wrapper {
      padding-right: 0.75ch;
    }
  }
}

.padding-wrapper {
  padding-top: 0ch !important;
  padding-bottom: 0ch !important;
}
</style>
