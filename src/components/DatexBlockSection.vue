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
      const ch = getChUnitInElement(el)

      // Calculate how many 3ch columns fit
      bytes.value = Math.floor(width.value / (ch * 3))

      // lineArray.value = someCalc()
    })
    observer.observe(box.value)
  }
})

// function someCalc() {
//   const objectsByLine = []
//   const sectionCopy = structuredClone(props.section)
//   console.log(`Bytes that fit ${bytes.value}`)

//   while (sectionCopy.fields.length) {
//     const testObject = structuredClone(props.section)
//     testObject.fields = []
//     let counter: number = bytes.value
//     while (counter > 0) {
//       const removedArrayElement = sectionCopy.fields.shift()
//       if (removedArrayElement == undefined) break
//       if (removedArrayElement.bytes.length > counter) {
//         const part1 = removedArrayElement.bytes.subarray(0, counter)
//         const part2 = removedArrayElement.bytes.subarray(counter)

//         const part1Object = structuredClone(removedArrayElement)
//         part1Object.bytes = part1
//         testObject.fields.push(part1Object)

//         const part2Object = structuredClone(removedArrayElement)
//         part2Object.bytes = part2
//         sectionCopy.fields.unshift(part2Object)
//         break
//       }
//       testObject.fields.push(removedArrayElement)
//       counter -= removedArrayElement.bytes.length
//     }
//     objectsByLine.push(testObject)
//   }
//   return objectsByLine
// }

onBeforeUnmount(() => {
  if (observer && box.value) observer.unobserve(box.value)
})

function getChUnitInElement(el: Element) {
  const test = document.createElement('span')
  test.style.display = 'inline-block'
  test.style.visibility = 'hidden'
  test.style.width = '1ch'
  test.textContent = ' ' // just to make it render
  el.appendChild(test)
  const chWidth = test.offsetWidth
  el.removeChild(test)
  return chWidth
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}

const Uint8ToHexString = (b: number): string => b.toString(16).padStart(2, '0')

document.querySelectorAll('.inv').forEach((e, i) => {
  e.addEventListener('mousemove', () => console.log(e))
})
</script>

<template>
  <div class="BlockProtocolSection">
    <div ref="box" :style="`grid-template-columns: repeat(${bytes}, 3ch);`" id="GridTest">
      <div v-for="(field, indexOuter) in section.fields" :key="indexOuter" class="inv">
        <div
          v-for="(byte, indexInner) in field.bytes"
          :key="indexInner"
          class="GridItem"
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
.inv {
  display: contents;
}

.inv div:hover {
  background: red;
}

.BlockProtocolSection {
  background-color: var(--color-secondary);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;

  font-family: monospace;
  font-size: 0.9rem;
}

#GridTest {
  display: grid;
  font-family: monospace;
  width: 100%;
}

.GridItem {
  border-radius: 0.7ch;
}
</style>
