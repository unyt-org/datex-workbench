<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import DatexBlockField from '@/components/DatexBlockField.vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
});

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
</script>

<template>
  <div class="block-protocol-section">
    <div ref="box" :style="`grid-template-columns: repeat(auto-fit, 3.5ch);`" class="bytes-grid">
      <DatexBlockField
        v-for="(field, indexOuter) in section.fields"
        :key="indexOuter"
        :field="field"
        :indexOuter="indexOuter"
      ></DatexBlockField>
    </div>
  </div>
</template>

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
</style>
