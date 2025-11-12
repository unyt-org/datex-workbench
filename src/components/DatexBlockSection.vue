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
      :style="`grid-template-columns: repeat(auto-fit, 3.5ch);`"
      class="test font-inherit grid gap-y-[0.75ch]"
    >
      <DatexBlockField
        v-for="(field, indexOuter) in section.fields"
        :key="indexOuter"
        :field="field"
        :indexOuter="indexOuter"
        :fieldColor="getCategoryColor(field.name)"
      ></DatexBlockField>
    </div>
  </div>
</template>

<style>
/* adjust grid gap and margins to prevent flickering when in between fields */
/*
.test:has(.field-wrapper:hover)
selects all divs that have a field-wrapper child that is being hovered over
if we leave this :has out, the greyscale will always apply and the colorizing still works
but this start is kind of like initializing that any greyscaling only happens when we hover over something
an almost similar example happens when we just write .test:hover. Only that this way hovering over the gaps of the grid also greys out the rest

:not(.field-wrapper:hover)
because of the space before :not, it is a descendant selector
this selects all the children of the .test element which are not being hovered over

div
another descendant selector, this is just neccessary because field-wrapper is a wrapper and the divs are the actual grid elements that we want to greyscale
*/

/* this currently is very twitchy when in between fields because it unhovers everything */
/* .test:has(.field-wrapper:hover) :not(.field-wrapper:hover) div {
  filter: grayscale(1);
} */

/* this is almost perfect because when your cursor is in the gap, the other elements just sty greyed out
the only problem is that they also stay greyed out when you are in the squared of area of the grid, so that is not ideal
*/
.test:hover :not(.field-wrapper:hover) div {
  filter: saturate(70%)brightness(60%);
}

/* a perfect solution would be to redo the grid elements, nest them one to give paddings and visually seperate the colored byte fields like that.
But that case makes the code a lot messier*/
</style>
