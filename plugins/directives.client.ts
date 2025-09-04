/**
 * Плагин для пользовательских директив
 */
export default defineNuxtPlugin(() => {
  // Директива v-scroll для отслеживания скролла (из старого проекта)
  const vScroll = {
    mounted(el: HTMLElement, binding: any) {
      const f = function (evt: Event) {
        if (binding.value(evt, el)) {
          window.removeEventListener('scroll', f)
        }
      }
      window.addEventListener('scroll', f)
    },
    
    unmounted(el: HTMLElement, binding: any) {
      // Очистка обработчика при размонтировании
      const f = function (evt: Event) {
        if (binding.value(evt, el)) {
          window.removeEventListener('scroll', f)
        }
      }
      window.removeEventListener('scroll', f)
    }
  }

  // Инжектим в приложение
  return {
    provide: {
      vScroll
    }
  }
})