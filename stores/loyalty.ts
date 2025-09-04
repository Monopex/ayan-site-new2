import { defineStore } from 'pinia'

export const useLoyaltyStore = defineStore('loyalty', () => {
  // Actions
  const login = async (body: any) => {
    try {
      // const data = await this.$axios.post(`${API}loyalty/activatedLoyalty/${this.$cookies.get('clientId')}`, body)
      // return data
      console.warn('login не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка входа в программу лояльности:', error)
      return { type: 'error' }
    }
  }

  const registration = async (body: any) => {
    try {
      // const data = await this.$axios.post(`${API}loyalty/activateClientService/${this.$cookies.get('clientId')}`, body)
      // return data
      console.warn('registration не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка регистрации в программе лояльности:', error)
      return { type: 'error' }
    }
  }

  const getCards = async () => {
    try {
      // const response = await this.$axios.get(`${API}loyalty/getClientLoyaltyData/${this.$cookies.get('clientId')}`)
      // return response.data
      console.warn('getCards не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения карт лояльности:', error)
      return { type: 'error' }
    }
  }

  return {
    // Actions
    login,
    registration,
    getCards
  }
})
