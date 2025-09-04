import { defineStore } from 'pinia'

const cardPlug = [{
  type: 'VISA',
  masked_pan: '**** **** **** ****',
  expire: ['2028', '12', '31'],
  isPlug: true
}]

export const useCardsStore = defineStore('cards', () => {
  // Actions
  const getUserCards = async (clientId: string) => {
    try {
      // const response = await this.$api.Cards.getUserCards(clientId)
      // if (response.type === 'error') {
      //   // Показываем уведомление об ошибке
      //   return cardPlug
      // }
      // if (!response.length) {
      //   return cardPlug
      // }
      // return response
      console.warn('getUserCards не реализован в новом API')
      return cardPlug
    } catch (error) {
      console.error('Ошибка получения карт пользователя:', error)
      return cardPlug
    }
  }

  const addNewCard = async (data: any) => {
    try {
      // const response = await this.$api.Cards.addNewCard(data)
      // if (response.type === 'error') {
      //   // Показываем уведомление об ошибке
      //   return
      // } else {
      //   // Показываем уведомление об успехе
      // }
      // return response
      console.warn('addNewCard не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка добавления карты:', error)
      throw error
    }
  }

  const rePayWithNewCard = async (data: any) => {
    try {
      // const response = await this.$api.Cards.rePayWithNewCard(data)
      // if (response.type === 'error') {
      //   // Показываем уведомление об ошибке
      //   return
      // } else {
      //   // Показываем уведомление об успехе
      // }
      // return response
      console.warn('rePayWithNewCard не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка повторной оплаты с новой картой:', error)
      throw error
    }
  }

  return {
    // Actions
    getUserCards,
    addNewCard,
    rePayWithNewCard
  }
})
