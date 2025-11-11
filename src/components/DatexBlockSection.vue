<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
});

const bytesCutoff: number = 30;

const box = ref<HTMLDivElement | null>(null);
const width = ref(0);
const bytes = ref(0);

let observer: ResizeObserver;

onMounted(() => {
  // console.log('Field object:', props.section);
  if (box.value) {
    observer = new ResizeObserver((entries) => {
      const el = entries[0]?.target;
      if (!el) return;
      width.value = el.clientWidth;

      // Measure 1ch within this element’s context
      const chWidth = getChUnitInElement(el);

      // console.log(`Width: ${width.value} \n chWidth: ${chWidth} \n no rounding: ${width.value / (chWidth * 3.5)}`)
      /* normally I would do (chWidth * 3.5) because the column width with all of its paddings and margins is supposed to be 3.5ch wide
       It does produce better results to do (chWidth * 3.3889) becuase of the way this width measurment is not completely in sync with what gets rendered */
      bytes.value = Math.floor(width.value / (chWidth * 3.3889));
    });
    observer.observe(box.value);
  }
});

onBeforeUnmount(() => {
  if (observer && box.value) observer.unobserve(box.value);
});

function getChUnitInElement(el: Element) {
  const test = document.createElement('span');
  test.style.display = 'inline-block';
  test.style.visibility = 'hidden';
  test.style.width = '1ch';
  test.textContent = ' ';
  el.appendChild(test);
  const chWidth = test.offsetWidth;
  el.removeChild(test);
  return chWidth;
}

const uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0');

// this will later hopefully be replaced by shadcn Tooltip hovering
// document.querySelectorAll('.field-wrapper').forEach((e, i) => {
//   e.addEventListener('mousemove', () => console.log(i))
// })

const categories = [
  ['Magic Number', 'Version', 'Context ID', 'Section Index', 'Block Number'],
  ['Block Size', 'Flags', 'Flags and Timestamp', 'Lifetime'],
  ['Checksum', 'Signature', 'Encrypted Signature', 'IV'],
  ['Distance', 'TTL'],
  ['Sender', 'Number of Receivers', 'Receivers', 'Represented By', 'On Behalf Of'],
  ['Receivers Pointer ID', 'Receivers with Keys'],
];

function getCategoryColor(str: string) {
  const index = categories.findIndex((subArray) => subArray.includes(str));
  return `var(--color-chart-${index !== -1 ? (index % 5) + 1 : null}`;
}

</script>

<template>
  <div class="block-protocol-section">
    <div ref="box" :style="`grid-template-columns: repeat(auto-fit, 3.5ch);`" class="bytes-grid">
      <div
        class="field-wrapper"
        v-for="(field, indexOuter) in section.fields"
        @click="console.log(`Name: ${field.name}, Value: ${field.parsedValue}`)"
        :key="indexOuter"
      >
        <div
          v-for="(byte, indexInner) in field.bytes.slice(0, bytesCutoff)"
          :key="indexInner"
          :style="{ backgroundColor: getCategoryColor(field.name) }"
        >
          {{ uint8ToHexString(byte) }}
        </div>
        <div
          v-if="field.bytes.length > bytesCutoff"
          :style="{ backgroundColor: getCategoryColor(field.name) }"
        >
          ..
        </div>
      </div>
    </div>
    <!-- <div style="background-color: green">Width: {{ width }}px</div>
    <div>Bytes that fit: {{ bytes }}</div> -->
  </div>
</template>

<!-- lang="postcss" um tailwind zu benutzen-->
<style scoped>
.block-protocol-section {
  background-color: var(--color-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 0.5ch;
  padding: 0.75ch;

  font-family: monospace;
  font-size: 0.9rem;
}

.bytes-grid {
  display: grid;
  grid-row-gap: 0.75ch;
  font-family: monospace;
  width: 100%;
}

.field-wrapper {
  display: contents;
}

.field-wrapper div {
  padding-left: 0.75ch;
}

/* nochmal genau die margins und paddings prüfen */
.field-wrapper div:first-child {
  border-bottom-left-radius: var(--radius-sm);
  border-top-left-radius: var(--radius-sm);
  margin-left: 0.25ch;
  padding-left: 0.5ch;
}

.field-wrapper div:last-child {
  border-bottom-right-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
  margin-right: 0.25ch;
  padding-right: 0.25ch;
}
</style>
