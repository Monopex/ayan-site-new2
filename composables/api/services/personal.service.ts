import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { Address, Order, Client } from '../core/types'

export class PersonalService {
  private client = getApiClient()

  /**
   * Получить адреса клиента
   */
  async getClientAddresses(clientId: string): Promise<Address[]> {
    return RetryHandler.withRetry(
      () => this.client.get<Address[]>(`client/${clientId}/address`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Добавить адрес клиента
   */
  async addClientAddress(addressData: {
    clientId: string
    street: string
    house: string
    apartment?: string
    entrance?: string
    floor?: string
    comment?: string
    geo: {
      lat: number
      lng: number
    }
  }): Promise<{ success: boolean; addressId?: string; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; addressId?: string; message?: string }>(
        `client/address/${addressData.clientId}/add`,
        addressData
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Удалить адрес клиента
   */
  async deleteClientAddress(addressId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.delete<{ success: boolean; message?: string }>(`admin/address/delete/${addressId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Редактировать информацию клиента
   */
  async editClientInfo(clientData: {
    name?: string
    surname?: string
    email?: string
    phone?: string
  }): Promise<{ success: boolean; message?: string }> {
    const headers = {
      'device-type': useCookie('device-type').value || '',
      'device-uuid': useCookie('device-uuid').value || ''
    }

    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>('client/update', clientData, { headers }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить информацию о клиенте
   */
  async getClientInfo(clientId: string): Promise<Client> {
    return RetryHandler.withRetry(
      () => this.client.get<Client>(`client/${clientId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить заказы клиента
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
   * Получить информацию о токене клиента
   */
  async getClientTokenInfo(): Promise<{
    clientId: string
    isActive: boolean
    expiresAt: string
  }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация')
    }

    return RetryHandler.withRetry(
      () => this.client.get<{
        clientId: string
        isActive: boolean
        expiresAt: string
      }>('admin/auth/token', {
        headers: { TOKEN: token }
      }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

}
