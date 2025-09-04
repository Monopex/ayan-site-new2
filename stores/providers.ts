import { defineStore } from 'pinia'

export const useProvidersStore = defineStore('providers', () => {
  // State
  const all = ref<any[]>([])

  // Getters
  const providers = computed(() => all.value)

  // Actions
  const getProviders = async () => {
    try {
      // const { data } = await this.$axios.get(`${API}site/provider/getAll`)
      // all.value = data
      // return data
      console.warn('getProviders не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения поставщиков:', error)
      throw error
    }
  }

  return {
    // State
    all: readonly(all),
    
    // Getters
    providers,
    
    // Actions
    getProviders
  }
})
