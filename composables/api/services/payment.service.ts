import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'

export interface PaymentType {
  id: string
  name: string
  nameKz?: string
  description?: string
  isActive: boolean
  iconUrl?: string
  minAmount?: number
  maxAmount?: number
  commission?: number
  isOnline: boolean
}

export interface PaymentMethod {
  id: string
  type: string
  name: string
  isAvailable: boolean
  requiresCard: boolean
  requiresPhone: boolean
}

export class PaymentService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить все типы оплаты
   */
  async getAllPaymentTypes(): Promise<PaymentType[]> {
    const cacheKey = 'payment-types:all'
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<PaymentType[]>('site/paymentType/all'),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить доступные способы оплаты для заказа
   */
  async getAvailablePaymentMethods(params: {
    orderId?: string
    totalAmount: number
    departmentId: number
  }): Promise<PaymentMethod[]> {
    return RetryHandler.withRetry(
      () => this.client.post<PaymentMethod[]>('site/payment/methods/available', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Создать платеж
   */
  async createPayment(params: {
    orderId: string
    paymentTypeId: string
    amount: number
    cardId?: string
  }): Promise<{
    paymentId: string
    status: string
    redirectUrl?: string
    qrCode?: string
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        paymentId: string
        status: string
        redirectUrl?: string
        qrCode?: string
      }>('site/payment/create', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Проверить статус платежа
   */
  async checkPaymentStatus(paymentId: string): Promise<{
    status: 'pending' | 'success' | 'failed' | 'cancelled'
    message?: string
  }> {
    return RetryHandler.withRetry(
      () => this.client.get<{
        status: 'pending' | 'success' | 'failed' | 'cancelled'
        message?: string
      }>(`site/payment/status/${paymentId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Отменить платеж
   */
  async cancelPayment(paymentId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; message?: string }>(`site/payment/cancel/${paymentId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить историю платежей
   */
  async getPaymentHistory(params: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    content: Array<{
      id: string
      orderId: string
      amount: number
      status: string
      createdAt: string
      paymentType: string
    }>
    totalPages: number
    totalElements: number
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        content: Array<{
          id: string
          orderId: string
          amount: number
          status: string
          createdAt: string
          paymentType: string
        }>
        totalPages: number
        totalElements: number
      }>('site/payment/history', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Инвалидировать кэш платежей
   */
  invalidatePaymentCache(): void {
    cacheUtils.invalidatePrefix('payment-')
  }
}
