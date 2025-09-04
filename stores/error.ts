import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', () => {
  // State
  const errorsList = ref<any[]>([])

  // Getters
  const errors = computed(() => errorsList.value)

  // Actions
  const getAllErrors = async () => {
    try {
      // const data = await this.$axios.$get(`${API}site/wrong/product/all/errors`)
      // if (data.type === 'success') {
      //   errorsList.value = data.data
      // }
      console.warn('getAllErrors не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения списка ошибок:', error)
      throw error
    }
  }

  const sendError = async (payload: any) => {
    try {
      // const data = await this.$axios.$post(`${API}site/wrong/product/add`, payload, {
      //   headers: {
      //     TOKEN: 'a'
      //   }
      // })
      // if (data.type === 'success') {
      //   return data
      // }
      console.warn('sendError не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка отправки ошибки:', error)
      return 0
    }
  }

  return {
    // State
    errorsList: readonly(errorsList),
    
    // Getters
    errors,
    
    // Actions
    getAllErrors,
    sendError
  }
})
