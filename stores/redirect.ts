import { defineStore } from 'pinia'

export const useRedirectStore = defineStore('redirect', () => {
  // State
  const all = ref<any[]>([])

  // Getters
  const redirects = computed(() => all.value)

  // Actions
  const getLink = async (redirectId: string) => {
    try {
      // return await this.$axios.$get(`${API}site/redirect/single/${redirectId}`)
      console.warn('getLink не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения ссылки редиректа:', error)
      return { type: 'error' }
    }
  }

  return {
    // State
    all: readonly(all),
    
    // Getters
    redirects,
    
    // Actions
    getLink
  }
})
