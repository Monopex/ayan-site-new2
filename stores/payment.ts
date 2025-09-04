import { defineStore } from 'pinia'

export const usePaymentStore = defineStore('payment', () => {
  // State
  const alltype = ref<any[]>([])
  const creditCards = ref<any[]>([])

  // Getters
  const paymentTypes = computed(() => alltype.value)
  const cards = computed(() => creditCards.value)

  // Actions
  const getAllPayType = async (payload: number[]) => {
    try {
      const body = {
        departmentIds: payload
      }
      // const data = await this.$axios.$post(`${API}site/paymentType/all`, body)
      // if (data.type === 'success') {
      //   alltype.value = data.data.map(item => item.paymentType)
      // }
      console.warn('getAllPayType не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения типов оплаты:', error)
      throw error
    }
  }

  const getOnlinePayLink = async (payload: string[]) => {
    try {
      let Url = 'https://ayanmarket.kz/'
      if (process.env.NODE_ENV === 'production') {
        Url = 'https://ayanmarket.kz/'
      }
      const request = {
        orderIds: payload,
        successBackUrl: Url + 'page/successOrder',
        failureBackUrl: Url + 'page/orders'
      }
      // const data = await this.$axios.$post(`${API}airbapay/create/payments`, request)
      // if (data.type !== 'error') {
      //   return data
      // }
      console.warn('getOnlinePayLink не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка получения ссылки на оплату:', error)
      return null
    }
  }

  const getCreditCards = async (payload: string) => {
    try {
      // const data = await this.$axios.$get(`${API}airbapay/cards/${payload}`)
      // if (data.type !== 'error') {
      //   creditCards.value = data
      // }
      console.warn('getCreditCards не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения кредитных карт:', error)
      throw error
    }
  }

  const addCreditCard = async (payload: string) => {
    try {
      let Url = 'https://ayanmarket.kz/'
      if (process.env.NODE_ENV === 'production') {
        Url = 'https://ayanmarket.kz/'
      }
      const request = {
        clientId: payload,
        successBackUrl: Url + 'page/personal-office',
        failureBackUrl: Url + 'page/personal-office'
      }
      // const data = await this.$axios.$post(`${API}airbapay/add/card`, request)
      // if (data.type !== 'error') {
      //   return data
      // }
      console.warn('addCreditCard не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка добавления кредитной карты:', error)
      return null
    }
  }

  const deleteCreditCard = async (payload: string) => {
    try {
      // const data = await this.$axios.$delete(`${API}airbapay/card/delete/${payload}`)
      // return data
      console.warn('deleteCreditCard не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка удаления кредитной карты:', error)
      throw error
    }
  }

  return {
    // State
    alltype: readonly(alltype),
    creditCards: readonly(creditCards),
    
    // Getters
    paymentTypes,
    cards,
    
    // Actions
    getAllPayType,
    getOnlinePayLink,
    getCreditCards,
    addCreditCard,
    deleteCreditCard
  }
})
