import { defineStore } from 'pinia'

export const useSMSStore = defineStore('sms', () => {
  // State
  const all = ref<any[]>([])

  // Getters
  const smsData = computed(() => all.value)

  // Actions
  const createClientCode = async (input: any) => {
    try {
      // return await this.$axios.$post(`${API}site/client/code`, input)
      console.warn('createClientCode не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка создания кода клиента:', error)
      return error.response?.data || { type: 'error' }
    }
  }

  const codeVerify = async (input: any) => {
    try {
      // return await this.$axios.$post(`${API}site/client/verify`, input)
      console.warn('codeVerify не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка верификации кода:', error)
      return { type: 'error' }
    }
  }

  const codeAuth = async (input: any) => {
    try {
      // return await this.$axios.$post(`${API}site/client/verify/token`, input)
      console.warn('codeAuth не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка авторизации по коду:', error)
      return {
        type: 'error',
        text: error.response?.data?.text || 'Неверный код'
      }
    }
  }

  return {
    // State
    all: readonly(all),
    
    // Getters
    smsData,
    
    // Actions
    createClientCode,
    codeVerify,
    codeAuth
  }
})