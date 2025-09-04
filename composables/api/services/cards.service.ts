import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'

export interface Card {
  id: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  isDefault: boolean
  isActive: boolean
}

export interface AddCardRequest {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
}

export interface LinkCardRequest {
  orderId: string
  cardId: string
}

export class CardsService {
  private client = getApiClient()

  /**
   * Получить карты пользователя
   */
  async getUserCards(clientId: string): Promise<Card[]> {
    return RetryHandler.withRetry(
      () => this.client.get<Card[]>(`airbapay/cards/${clientId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Добавить новую карту
   */
  async addNewCard(cardData: AddCardRequest): Promise<{ success: boolean; cardId?: string; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; cardId?: string; message?: string }>('airbapay/add/card', cardData),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Привязать карту к заказу
   */
  async linkCardToOrder(linkData: LinkCardRequest): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; message?: string }>('airbapay/link/card', linkData),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Удалить карту
   */
  async deleteCard(cardId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.delete<{ success: boolean; message?: string }>(`airbapay/cards/${cardId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Установить карту по умолчанию
   */
  async setDefaultCard(cardId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(`airbapay/cards/${cardId}/default`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }
}
