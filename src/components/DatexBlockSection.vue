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
const bytes = ref(1);

let observer: ResizeObserver;

onMounted(() => {
  console.log('Field object:', props.section);
  if (box.value) {
    observer = new ResizeObserver((entries) => {
      const el = entries[0]?.target;
      if (!el) return;
      width.value = el.clientWidth;

      // Measure 1ch within this element’s context
      const chWidth = getChUnitInElement(el);

      // console.log(`Width: ${width.value} \n chWidth: ${chWidth} \n no rounding: ${width.value / (chWidth * 3)}`)
      /* normally I would do (chWidth * 3) because the column width with all of its paddings and margins is supposed to be 3ch wide
       It does produce better results to do (chWidth * 2.8) becuase of the way this width measurment is not completely in sync with what gets rendered */
      bytes.value = Math.floor(width.value / (chWidth * 3));
    });
    observer.observe(box.value);
  }
});

onBeforeUnmount(() => {
  if (observer && box.value) observer.unobserve(box.value);
});

function getChUnitInElement(el: Element) {
  const tempDomElement = document.createElement('span');
  tempDomElement.style.display = 'inline-block';
  tempDomElement.style.visibility = 'hidden';
  tempDomElement.style.width = '1ch';
  tempDomElement.textContent = ' ';
  el.appendChild(tempDomElement);
  const chWidth = tempDomElement.offsetWidth;
  el.removeChild(tempDomElement);
  return chWidth;
}

const categories = [
  ['Magic Number', 'Version', 'Context ID', 'Section Index', 'Block Number'],
  ['Block Size', 'Flags', 'Flags and Timestamp', 'Lifetime'],
  ['Distance', 'TTL'],
  ['Sender', 'Number of Receivers', 'Receivers', 'Represented By', 'On Behalf Of'],
  ['Receivers Pointer ID', 'Receivers with Keys'],
  ['Checksum', 'Signature', 'Encrypted Signature', 'IV'],
];

function getCategoryColor(str: string) {
  const index = categories.findIndex((subArray) => subArray.includes(str));
  return `var(--chart-${((index + 5) % 5) + 1})`;
}
</script>

<template>
  <div class="bg-secondary mb-[0.5ch] rounded-lg p-[0.75ch] font-mono">
    <div
      ref="box"
      :style="`grid-template-columns: repeat(auto-fit, 3ch);`"
      class="grid-box text-foreground grid text-base"
    >
      <div v-for="(field, indexOuter) in section.fields" :key="indexOuter" class="contents">
        <div
          v-if="
            Object.hasOwn(field, 'subFields') &&
            field.bytes.length == field.subFields.reduce((acc, e) => acc + e.bytes.length, 0)
          "
          class="contents"
        >
          <DatexBlockField
            v-for="(subField, index) in field.subFields"
            :key="index"
            :field="subField"
            :indexOuter="indexOuter"
            :fieldColor="getCategoryColor(field.name)"
          ></DatexBlockField>
        </div>
        <div v-else class="contents">
          <DatexBlockField
            :field="field"
            :indexOuter="indexOuter"
            :fieldColor="getCategoryColor(field.name)"
          ></DatexBlockField>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/*
.grid-box:has(.field-wrapper:hover)
selects all divs that have a field-wrapper child that is being hovered over
if we leave this :has out, the greyscale will always apply and the colorizing still works
but this start is kind of like initializing that any greyscaling only happens when we hover over something
an almost similar example happens when we just write .grid-box:hover. Only that this way hovering over the gaps of the grid also greys out the rest

:not(.field-wrapper:hover)
because of the space before :not, it is a descendant selector
this selects all the children of the .grid-box element which are not being hovered over
*/

.grid-box:has(.field-wrapper:hover) div div :not(.field-wrapper:hover) div div {
  filter: saturate(20%) brightness(40%);
}
</style>
