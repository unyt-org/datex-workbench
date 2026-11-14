import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useWindowControlsOverlayCssVariables() {

  let wco: any;

  function updateTitlebarInsets() {
    if (!wco?.visible) {
      document.documentElement.style.setProperty(
        '--titlebar-right-inset',
        '0px'
      );
      document.documentElement.style.setProperty(
        '--titlebar-left-inset',
        '0px'
      );
      return
    }

    const rect = wco.getTitlebarAreaRect()
    const right = window.innerWidth - (rect.x + rect.width)

    // subtract width of left sidebar for left inset
    const leftSidebarWidth = 63; // TODO: get dynamically

    document.documentElement.style.setProperty(
      '--titlebar-right-inset',
      `${right}px`
    );
    document.documentElement.style.setProperty(
      '--titlebar-left-inset',
      `${rect.x - leftSidebarWidth}px`
    );
  }

  onMounted(() => {
    wco = navigator.windowControlsOverlay

    updateTitlebarInsets()

    wco?.addEventListener('geometrychange', updateTitlebarInsets)
    window.addEventListener('resize', updateTitlebarInsets)
  })

  onUnmounted(() => {
    wco?.removeEventListener('geometrychange', updateTitlebarInsets)
    window.removeEventListener('resize', updateTitlebarInsets)
  })

}

export function useWindowControlsOverlay(): Ref<boolean> {
  const isWindowControlsOverlay = ref(false)

  let wco: WindowControlsOverlay | undefined

  const update = () => {
    isWindowControlsOverlay.value = wco?.visible ?? false
  }

  onMounted(() => {
    wco = navigator.windowControlsOverlay

    update()
    wco?.addEventListener('geometrychange', update)
  })

  onUnmounted(() => {
    wco?.removeEventListener('geometrychange', update)
  })

  return isWindowControlsOverlay
}
