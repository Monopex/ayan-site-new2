import { defineStore } from 'pinia'

export const useActionsStore = defineStore('actions', () => {
  // State
  const all = ref<any[]>([])

  // Getters
  const actions = computed(() => all.value)

  // Actions
  const getAll = async (input: any) => {
    try {
      // Здесь будет вызов API для получения акций
      // const data = await this.$api.Actions.getAll(input)
      // if (data.type !== 'error') {
      //   all.value = data
      // }
      console.warn('getAll не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения акций:', error)
      throw error
    }
  }

  return {
    // State
    all: readonly(all),
    
    // Getters
    actions,
    
    // Actions
    getAll
  }
})
