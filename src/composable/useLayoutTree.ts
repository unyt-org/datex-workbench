import { reactive } from 'vue'
import { getNewPanelId } from '@/utils/idPanelGenerator.ts'

const layoutTree = reactive({
  type: 'panel',
  id: getNewPanelId(),
  data: {},
})

export function useLayoutTree() {
  return { layoutTree }
}
