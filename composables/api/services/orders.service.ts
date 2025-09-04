import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { Order, CreateOrderRequest } from '../core/types'

export class OrdersService {
  private client = getApiClient()

  /**
   * Создать заказ (новая версия API)
   */
  async createOrderV2(orderData: CreateOrderRequest): Promise<{ orderId: string; status: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ orderId: string; status: string }>('web/provider/order/createV2', orderData),
      { maxRetries: 2, baseDelay: 2000 }
    )
  }

  /**
   * Проверить заказ
   */
  async checkOrder(orderData: Partial<CreateOrderRequest>): Promise<{ valid: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ valid: boolean; message?: string }>('web/provider/order/check', orderData),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Создать заказ (старая версия API)
   */
  async createOrder(orderData: CreateOrderRequest): Promise<{ orderId: string; status: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ orderId: string; status: string }>('site/provider/order/create', orderData),
      { maxRetries: 2, baseDelay: 2000 }
    )
  }

  /**
   * Отменить заказ
   */
  async cancelOrder(params: {
    orderId: string
    tagId: string
  }): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(
        `client/providerOrder/order/${params.orderId}/${params.tagId}/cancel`
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить теги для отмены заказа
   */
  async getCancelTags(): Promise<{ id: string; name: string; description?: string }[]> {
    return RetryHandler.withRetry(
      () => this.client.get<{ id: string; name: string; description?: string }[]>('client/cancelOrderTag/all'),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Скачать чек
   */
  async downloadCheck(orderId: string): Promise<Blob> {
    return RetryHandler.withRetry(
      () => this.client.get<Blob>(`site/ukassa/check/${orderId}`, {
        responseType: 'blob'
      }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Рассчитать стоимость доставки
   */
  async calculateDelivery(params: {
    address: {
      lat: number
      lng: number
      street: string
      house: string
    }
    departmentId: number
    totalPrice: number
  }): Promise<{
    deliveryPrice: number
    freeDeliveryThreshold: number
    estimatedTime: string
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        deliveryPrice: number
        freeDeliveryThreshold: number
        estimatedTime: string
      }>('site/delivery/calculate', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить историю заказов клиента
   */
  async getClientOrders(): Promise<Order[]> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для получения заказов')
    }

    return RetryHandler.withRetry(
      () => this.client.get<Order[]>('web/client/providerOrder/get/order/history', {
        headers: { TOKEN: token }
      }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить продукты заказа
   */
  async getOrderProducts(params: {
    orderId: string
    departmentId: string
  }): Promise<any[]> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для получения продуктов заказа')
    }

    return RetryHandler.withRetry(
      () => this.client.get<any[]>(`site/product/order/${params.orderId}/department/${params.departmentId}`, {
        headers: { TOKEN: token }
      }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Валидация данных заказа
   */
  validateOrderData(orderData: CreateOrderRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!orderData.phoneUser) {
      errors.push('Необходимо указать телефон')
    }

    if (!orderData.nameUser) {
      errors.push('Необходимо указать имя')
    }

    if (!orderData.surnameUser) {
      errors.push('Необходимо указать фамилию')
    }

    if (!orderData.departmentId) {
      errors.push('Необходимо выбрать департамент')
    }

    if (!orderData.products || orderData.products.length === 0) {
      errors.push('Корзина пуста')
    }

    if (!orderData.paymentTypeId) {
      errors.push('Необходимо выбрать способ оплаты')
    }

    if (!orderData.address || !orderData.address.street) {
      errors.push('Необходимо указать адрес доставки')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
