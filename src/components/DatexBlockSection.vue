<script setup lang="ts">
// import DatexBlockField from './DatexBlockField.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
})

const box = ref<HTMLDivElement | null>(null)
const width = ref(0)
const bytes = ref(0)

let observer: ResizeObserver

onMounted(() => {
  console.log('Field object:', props.section)
  if (box.value) {
    observer = new ResizeObserver((entries) => {
      const el = entries[0].target
      width.value = el.clientWidth

      // Measure 1ch within this element’s context
      const chWidth = getChUnitInElement(el)

      // Calculate how many 3ch columns fit
      bytes.value = Math.floor(width.value / (chWidth * 3))
    })
    observer.observe(box.value)
  }
})

onBeforeUnmount(() => {
  if (observer && box.value) observer.unobserve(box.value)
})

function getChUnitInElement(el: Element) {
  const test = document.createElement('span')
  test.style.display = 'inline-block'
  test.style.visibility = 'hidden'
  test.style.width = '1ch'
  test.textContent = ' '
  el.appendChild(test)
  const chWidth = test.offsetWidth
  el.removeChild(test)
  return chWidth
}

const Uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0')

// this will later hopefully be replaced by shadcn Tooltip hovering
// document.querySelectorAll('.fieldWrapper').forEach((e, i) => {
//   e.addEventListener('mousemove', () => console.log(i))
// })
</script>

<template>
  <div class="BlockProtocolSection">
    <!-- this way we use the calculated value for how many bytes fit in the witdh of the column -->
    <!-- <div ref="box" :style="`grid-template-columns: repeat(${bytes}, 3ch);`" id="BytesGrid"> -->
    <div id="BytesGrid" ref="box" :style="`grid-template-columns: repeat(auto-fit, 3ch);`">
      <div class="fieldWrapper" v-for="(field, indexOuter) in section.fields" :key="indexOuter">
        <div
          v-for="(byte, indexInner) in field.bytes"
          :key="indexInner"
          :style="`background-color: var(--color-chart-${(indexOuter % 5) + 1});`"
        >
          {{ Uint8ToHexString(byte) }}
        </div>
      </div>
    </div>
    <div>Width: {{ width }}px</div>
    <div>Bytes that fit: {{ bytes }}</div>
  </div>
</template>

<style scoped>
.fieldWrapper {
  display: contents;
}

/* this currently doesn't do anything because the childs set their style dynamicly */
.fieldWrapper div:hover {
  background-color: red;
}

.fieldWrapper div:first-child {
  border-bottom-left-radius: 0.7ch;
  border-top-left-radius: 0.7ch;
}

.fieldWrapper div:last-child {
  border-bottom-right-radius: 0.7ch;
  border-top-right-radius: 0.7ch;
}

.BlockProtocolSection {
  background-color: var(--color-secondary);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;

  font-family: monospace;
  font-size: 0.9rem;
}

#BytesGrid {
  display: grid;
  font-family: monospace;
  width: 100%;
}
</style>
