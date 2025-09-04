import { defineStore } from 'pinia'
import { OrdersService } from '~/composables/api'

export interface OrderProduct {
  productId: string
  providerId: string
  departmentId: string
  amount: number
  price: number
  totalPrice: number
  totalDiscountPrice?: number
  discountPrice?: number
  productName: string
  productNameKz?: string
  measureType: string
  amountStep: number | string
  departmentName: string
  departmentIsAyan: boolean
  categoryId: string
  balance: number
  isFavorite?: boolean
}

export interface Order {
  id: string
  status: string
  totalPrice: number
  deliveryPrice: number
  createdAt: string
  deliveryTime?: string
  address: {
    street: string
    house: string
    apartment?: string
    comment?: string
  }
  products: OrderProduct[]
  paymentType: {
    id: string
    name: string
  }
  cancelTags?: Array<{
    id: string
    name: string
    description?: string
  }>
}

export interface DeliveryInfo {
  deliveryPrice: number
  freeDeliveryThreshold: number
  estimatedTime: string
}

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orderProducts = ref<OrderProduct[]>([])
  const orderDepartments = ref<any[]>([])
  const cancelTags = ref<Array<{ id: string; name: string; description?: string }>>([])
  const delivery = ref<Record<string, DeliveryInfo> | null>(null)
  const lastOrders = ref<Order[]>([])
  const checkResults = ref<any[]>([])

  // Services
  const ordersService = new OrdersService()

  // Getters
  const products = computed(() => orderProducts.value)
  const departments = computed(() => orderDepartments.value)
  const tags = computed(() => cancelTags.value)
  const deliveryInfo = computed(() => delivery.value)
  const last = computed(() => lastOrders.value)
  const check = computed(() => checkResults.value)

  // Actions
  const addProductsList = (input: { products: OrderProduct[]; departments: any[] }) => {
    // ПРИМЕЧАНИЕ: input.products — это массив объектов, полученных из BasketPage,
    // и в них уже есть все нужные поля (price, oldPrice, discountPrice, totalDiscountPrice, amount и т.д.).
    // Но мы не хотим просто запихнуть ссылки на те же самые объекты,
    // а сделаем «плоскую» копию каждого объекта через {...p}.
    const fullCopy = input.products.map(p => ({ ...p }))
    orderProducts.value = fullCopy
    orderDepartments.value = input.departments
  }

  const clearOrderList = () => {
    orderProducts.value = []
    orderDepartments.value = []
  }

  const addLastOrder = (input: Order) => {
    lastOrders.value.push(input)
  }

  const clearLastOrder = () => {
    lastOrders.value = []
  }

  const applyCheckResults = (checkResponse: any[]) => {
    if (!checkResponse || checkResponse.length === 0) {
      return { type: 'ok' } // Нет изменений
    }

    let hasErrors = false
    const changedPriceProducts: any[] = []

    checkResponse.forEach((item) => {
      if (item.isAvailable === false) {
        // Товар недоступен
        hasErrors = true
      } else {
        // Товар доступен (true или null)
        const oldProduct = orderProducts.value.find(p => p.productId === item.productId)
        if (!oldProduct) return

        // Если филиал сменился
        if (item.newDepartmentId && oldProduct.departmentId !== item.newDepartmentId) {
          updateProductDepartment({
            productId: oldProduct.productId,
            newDepartmentId: item.newDepartmentId
          })
        }

        // Если цена изменилась
        if (item.newPrice != null && item.newPrice !== oldProduct.price) {
          changedPriceProducts.push({
            productId: oldProduct.productId,
            oldName: oldProduct.productName,
            oldPrice: oldProduct.price,
            newPrice: item.newPrice
          })
          updateProductPrice({
            productId: oldProduct.productId,
            newPrice: item.newPrice
          })
        }
      }
    })

    if (hasErrors) {
      return { type: 'error' }
    }
    if (changedPriceProducts.length) {
      return { type: 'changed', changed: changedPriceProducts }
    }
    return { type: 'ok' }
  }

  const checkOrder = async (input: any) => {
    try {
      const response = await ordersService.checkOrder(input)
      checkResults.value = response
      return response
    } catch (error) {
      console.error('Ошибка при проверке заказа:', error)
      if (error.response) {
        console.error('Ответ сервера:', error.response.data)
        // Показываем уведомление об ошибке
        console.warn('Ошибка проверки заказа:', error.response.data.message || 'Непредвиденная ошибка при проверке заказа.')
      }
      throw error
    }
  }

  const sendOrder = async (input: any) => {
    try {
      const data = await ordersService.createOrder(input)
      return data
    } catch (error) {
      console.error('Ошибка создания заказа:', error)
      throw error
    }
  }

  const createOrderV2 = async (input: any) => {
    try {
      const deviceType = useCookie('device-type').value || ''
      const deviceUuid = useCookie('device-uuid').value || ''

      const response = await ordersService.createOrderV2({
        ...input,
        deviceType,
        deviceUuid
      })
      return response
    } catch (error) {
      console.error('Ошибка создания заказа V2:', error)
      if (error.response) {
        console.error('Ответ сервера:', error.response.data)
        // Показываем уведомление об ошибке
        console.warn('Ошибка создания заказа:', error.response.data.message || 'Непредвиденная ошибка при создании заказа.')
      }
      throw error
    }
  }

  const getCancelTags = async () => {
    try {
      const data = await ordersService.getCancelTags()
      cancelTags.value = data
      return data
    } catch (error) {
      console.error('Ошибка получения тегов отмены:', error)
      throw error
    }
  }

  const getOrderDelivery = async (payload: {
    products: Array<{
      depId: string
      products: any[]
    }>
    cityId: number
  }) => {
    try {
      const total: Record<string, DeliveryInfo> = {}
      const resp = payload.products.map((item) => ({
        departmentId: item.depId,
        products: item.products,
        cityId: payload.cityId
      }))

      for (let i = 0; i < resp.length; i += 1) {
        const data = await ordersService.calculateDelivery({
          address: {
            lat: 43.2220, // Нужно получить из геолокации
            lng: 76.8512,
            street: '',
            house: ''
          },
          departmentId: parseInt(resp[i].departmentId),
          totalPrice: 0 // Нужно вычислить
        })
        total[resp[i].departmentId] = data
      }
      
      delivery.value = total
      return total
    } catch (error) {
      console.error('Ошибка расчета доставки:', error)
      throw error
    }
  }

  const cancelOrder = async (payload: { orderId: string; tagId: string }) => {
    try {
      const data = await ordersService.cancelOrder(payload)
      return data
    } catch (error) {
      console.error('Ошибка отмены заказа:', error)
      throw error
    }
  }

  const downloadCheck = async (id: string) => {
    try {
      const data = await ordersService.downloadCheck(id)
      return data
    } catch (error) {
      console.error('Ошибка скачивания чека:', error)
      throw error
    }
  }

  // Mutations (локальные изменения состояния)
  const updateProductPrice = (params: { productId: string; newPrice: number }) => {
    const idx = orderProducts.value.findIndex(p => p.productId === params.productId)
    if (idx !== -1) {
      // Правильный вариант: клонируем старый объект, правим нужные поля, и заменяем в массиве.
      const old = orderProducts.value[idx]
      const copy = { ...old }
      copy.price = params.newPrice
      // Пересчитываем totalPrice
      copy.totalPrice = params.newPrice * copy.amount
      // Если в original был discountPrice (и мы хотим сохранить логику скидки),
      // пересчитаем totalDiscountPrice:
      if (copy.discountPrice != null) {
        // totalDiscountPrice = discountPrice * amount
        copy.totalDiscountPrice = copy.discountPrice * copy.amount
      }
      // Вставим изменённый объект обратно на ту же позицию:
      orderProducts.value.splice(idx, 1, copy)
    }
  }

  const updateProductDepartment = (params: { productId: string; newDepartmentId: string }) => {
    const product = orderProducts.value.find(p => p.productId === params.productId)
    if (product) {
      product.departmentId = params.newDepartmentId
    }
  }

  return {
    // State
    orderProducts: readonly(orderProducts),
    orderDepartments: readonly(orderDepartments),
    cancelTags: readonly(cancelTags),
    delivery: readonly(delivery),
    lastOrders: readonly(lastOrders),
    checkResults: readonly(checkResults),
    
    // Getters
    products,
    departments,
    tags,
    deliveryInfo,
    last,
    check,
    
    // Actions
    addProductsList,
    clearOrderList,
    addLastOrder,
    clearLastOrder,
    applyCheckResults,
    checkOrder,
    sendOrder,
    createOrderV2,
    getCancelTags,
    getOrderDelivery,
    cancelOrder,
    downloadCheck
  }
})
