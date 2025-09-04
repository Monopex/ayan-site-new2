import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { CartItem, CartDetails } from '../core/types'

export class CartService {
  private client = getApiClient()

  /**
   * Получить корзину клиента
   */
  async getClientCart(params: {
    clientId: string
    departmentIds: number[]
  }): Promise<CartItem[]> {
    return RetryHandler.withRetry(
      () => this.client.post<CartItem[]>('client/providerBasket/get', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Добавить товар в корзину
   */
  async addToCart(item: CartItem): Promise<void> {
    await RetryHandler.withRetry(
      () => this.client.post('client/providerBasket/add', item),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Обновить количество товара в корзине
   */
  async updateCartItem(params: {
    productId: string
    providerId: string
    departmentId: string
    amount: number
  }): Promise<{ overWeight?: boolean; departmentName?: string; limit?: number }[]> {
    const headers = {
      'device-type': useCookie('device-type').value || '',
      'device-uuid': useCookie('device-uuid').value || ''
    }

    return RetryHandler.withRetry(
      () => this.client.put<{ overWeight?: boolean; departmentName?: string; limit?: number }[]>(
        'client/providerBasket/edit',
        {
          amount: parseFloat(params.amount.toString()),
          clientId: useCookie('clientId').value,
          departmentId: params.departmentId,
          productId: params.productId,
          providerId: parseFloat(params.providerId)
        },
        { headers }
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Удалить товар из корзины
   */
  async removeFromCart(items: CartItem[]): Promise<void> {
    const headers = {
      'device-type': useCookie('device-type').value || '',
      'device-uuid': useCookie('device-uuid').value || ''
    }

    await RetryHandler.withRetry(
      () => this.client.delete('client/providerBasket/deletePart', items, { headers }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Очистить корзину
   */
  async clearCart(): Promise<void> {
    const params = {
      clientId: useCookie('clientId').value,
      departmentIds: useCookie('availableDepartments').value || []
    }

    await RetryHandler.withRetry(
      () => this.client.delete('client/providerBasket/delete/all', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Повторно добавить товар в корзину по ID
   */
  async reAddProductToCart(productId: string): Promise<{ status: string; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.get<{ status: string; message?: string }>(`client/providerBasket/reAdd/${productId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Повторно добавить заказ в корзину
   */
  async reAddOrderToCart(orderId: string): Promise<{ status: string; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.get<{ status: string; message?: string }>(`client/providerBasket/redo/${orderId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Проверить вес заказа
   */
  async checkWeight(params: {
    products: Array<{
      productId: string
      providerId: string
      departmentId: string
      amount: number
    }>
  }): Promise<{ overWeight?: boolean; departmentName?: string; limit?: number }[]> {
    return RetryHandler.withRetry(
      () => this.client.post<{ overWeight?: boolean; departmentName?: string; limit?: number }[]>(
        'client/providerBasket/calculate',
        params
      ),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Вычислить детали корзины
   */
  calculateCartDetails(items: CartItem[]): CartDetails {
    let totalAmount = 0
    let totalPrice = 0
    const totalLength = items.length

    for (const item of items) {
      totalAmount += parseFloat((item.amount || 0).toString())
      const unitPrice = item.price != null ? item.price : item.totalPrice || 0
      totalPrice += parseFloat((item.amount || 0).toString()) * parseFloat(unitPrice.toString())
    }

    return {
      totalAmount,
      totalPrice: Math.ceil(totalPrice),
      totalLength
    }
  }

  /**
   * Добавить пакет АЯН
   */
  addAyanPacket(cartItems: CartItem[], departmentId: number, departmentName: string): CartItem | null {
    // Проверяем, есть ли товары АЯН в корзине
    const ayanItems = cartItems.filter(item => item.departmentIsAyan)
    if (ayanItems.length === 0) return null

    // Вычисляем стоимость товаров АЯН
    const ayanPrice = ayanItems.reduce((acc, item) => {
      return acc + (item.totalDiscountPrice || item.totalPrice || 0)
    }, 0)

    // Определяем количество пакетов
    const packetStep = 1000 // Шаг для пакетов
    let packetAmount = 1
    if (ayanPrice > packetStep) {
      packetAmount = Math.floor(ayanPrice / packetStep) + 1
    }

    // Определяем providerId в зависимости от департамента
    const providerId = departmentId === 35 ? 2431 : 2435

    const packet: CartItem = {
      productId: '748749',
      providerId: providerId.toString(),
      departmentId: departmentId.toString(),
      amount: packetAmount,
      price: 16,
      totalPrice: packetAmount * 16,
      productName: 'ПАКЕТ АЯН',
      productNameKz: 'ПАКЕТ АЯН',
      measureType: 'шт',
      amountStep: 1,
      departmentName,
      departmentIsAyan: true,
      categoryId: '303',
      balance: 1000,
      forPacket: true
    }

    return packet
  }

  /**
   * Проверить, нужно ли добавить пакет
   */
  shouldAddPacket(cartItems: CartItem[]): boolean {
    const ayanItems = cartItems.filter(item => item.departmentIsAyan)
    return ayanItems.length > 0 && !cartItems.some(item => item.forPacket)
  }

  /**
   * Проверить, нужно ли удалить пакет
   */
  shouldRemovePacket(cartItems: CartItem[]): boolean {
    const ayanItems = cartItems.filter(item => item.departmentIsAyan)
    const packetItems = cartItems.filter(item => item.forPacket)
    
    return packetItems.length > 0 && ayanItems.length <= 1
  }
}
