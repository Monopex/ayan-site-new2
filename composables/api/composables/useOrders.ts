import { ref, computed } from 'vue'
import { OrdersService } from '../services/orders.service'
import type { Order, CreateOrderRequest } from '../core/types'

const ordersService = new OrdersService()

export const useOrders = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const deliveryInfo = ref<{
    deliveryPrice: number
    freeDeliveryThreshold: number
    estimatedTime: string
  } | null>(null)

  // Вычисляемые свойства
  const hasOrders = computed(() => orders.value.length > 0)
  const totalOrders = computed(() => orders.value.length)
  const activeOrders = computed(() => orders.value.filter(order => order.status !== 'completed' && order.status !== 'cancelled'))

  // Методы для работы с заказами
  const createOrder = async (orderData: CreateOrderRequest): Promise<{ orderId: string; status: string } | null> => {
    loading.value = true
    error.value = null

    try {
      // Валидация данных заказа
      const validation = ordersService.validateOrderData(orderData)
      if (!validation.valid) {
        error.value = validation.errors.join(', ')
        return null
      }

      const result = await ordersService.createOrderV2(orderData)
      return result
    } catch (err: any) {
      error.value = err.message || 'Ошибка при создании заказа'
      return null
    } finally {
      loading.value = false
    }
  }

  const checkOrder = async (orderData: Partial<CreateOrderRequest>): Promise<{ valid: boolean; message?: string } | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await ordersService.checkOrder(orderData)
      return result
    } catch (err: any) {
      error.value = err.message || 'Ошибка при проверке заказа'
      return null
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (orderId: string, tagId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await ordersService.cancelOrder({ orderId, tagId })
      if (result.success) {
        // Обновляем статус заказа в локальном состоянии
        const orderIndex = orders.value.findIndex(order => order.orderId === orderId)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'cancelled'
        }
        return true
      } else {
        error.value = result.message || 'Ошибка при отмене заказа'
        return false
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка при отмене заказа'
      return false
    } finally {
      loading.value = false
    }
  }

  const getCancelTags = async (): Promise<{ id: string; name: string; description?: string }[]> => {
    loading.value = true
    error.value = null

    try {
      const tags = await ordersService.getCancelTags()
      return tags
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке тегов отмены'
      return []
    } finally {
      loading.value = false
    }
  }

  const downloadCheck = async (orderId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const blob = await ordersService.downloadCheck(orderId)
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `check_${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при скачивании чека'
      return false
    } finally {
      loading.value = false
    }
  }

  const calculateDelivery = async (params: {
    address: {
      lat: number
      lng: number
      street: string
      house: string
    }
    departmentId: number
    totalPrice: number
  }): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await ordersService.calculateDelivery(params)
      deliveryInfo.value = result
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при расчете доставки'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchClientOrders = async (): Promise<Order[]> => {
    loading.value = true
    error.value = null

    try {
      const ordersList = await ordersService.getClientOrders()
      orders.value = ordersList
      return ordersList
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке заказов'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchOrderProducts = async (orderId: string, departmentId: string): Promise<any[]> => {
    loading.value = true
    error.value = null

    try {
      const products = await ordersService.getOrderProducts({ orderId, departmentId })
      return products
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке продуктов заказа'
      return []
    } finally {
      loading.value = false
    }
  }

  // Утилиты
  const getOrderById = (orderId: string): Order | undefined => {
    return orders.value.find(order => order.orderId === orderId)
  }

  const getOrdersByStatus = (status: string): Order[] => {
    return orders.value.filter(order => order.status === status)
  }

  const clearError = (): void => {
    error.value = null
  }

  const clearDeliveryInfo = (): void => {
    deliveryInfo.value = null
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    orders: readonly(orders),
    currentOrder: readonly(currentOrder),
    deliveryInfo: readonly(deliveryInfo),
    
    // Вычисляемые свойства
    hasOrders,
    totalOrders,
    activeOrders,
    
    // Методы
    createOrder,
    checkOrder,
    cancelOrder,
    getCancelTags,
    downloadCheck,
    calculateDelivery,
    fetchClientOrders,
    fetchOrderProducts,
    getOrderById,
    getOrdersByStatus,
    clearError,
    clearDeliveryInfo
  }
}
