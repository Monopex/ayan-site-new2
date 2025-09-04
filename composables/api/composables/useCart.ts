import { ref, computed } from 'vue'
import { CartService } from '../services/cart.service'
import type { CartItem, CartDetails } from '../core/types'

const cartService = new CartService()

export const useCart = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const items = ref<CartItem[]>([])
  const details = ref<CartDetails>({
    totalAmount: 0,
    totalPrice: 0,
    totalLength: 0
  })

  // Вычисляемые свойства
  const isEmpty = computed(() => items.value.length === 0)
  const hasItems = computed(() => items.value.length > 0)
  const totalItems = computed(() => details.value.totalLength)
  const totalAmount = computed(() => details.value.totalAmount)
  const totalPrice = computed(() => details.value.totalPrice)
  const ayanItems = computed(() => items.value.filter(item => item.departmentIsAyan))
  const regularItems = computed(() => items.value.filter(item => !item.departmentIsAyan))

  // Методы для работы с корзиной
  const fetchCart = async (): Promise<CartItem[]> => {
    loading.value = true
    error.value = null

    try {
      const clientId = useCookie('clientId').value
      const departmentIds = useCookie('availableDepartments').value || []

      if (!clientId || !departmentIds.length) {
        throw new Error('Необходима авторизация для загрузки корзины')
      }

      const cartItems = await cartService.getClientCart({
        clientId,
        departmentIds: Array.isArray(departmentIds) ? departmentIds : JSON.parse(departmentIds)
      })

      items.value = cartItems
      updateDetails()
      return cartItems
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке корзины'
      return []
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (item: CartItem): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await cartService.addToCart(item)
      
      // Обновляем локальное состояние
      const existingIndex = items.value.findIndex(
        existing => existing.productId === item.productId && 
                   existing.providerId === item.providerId && 
                   existing.departmentId === item.departmentId
      )

      if (existingIndex !== -1) {
        items.value[existingIndex] = item
      } else {
        items.value.push(item)
      }

      updateDetails()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при добавлении товара в корзину'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (params: {
    productId: string
    providerId: string
    departmentId: string
    amount: number
  }): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await cartService.updateCartItem(params)
      
      // Обрабатываем предупреждения о превышении веса
      if (response.length > 0) {
        response.forEach(warning => {
          if (warning.overWeight) {
            // Показываем уведомление о превышении веса
            console.warn(`На филиале ${warning.departmentName}, превышен лимит веса на ${warning.overWeight} кг из ${warning.limit}. Доставка будет только до подъезда.`)
          }
        })
      }

      // Обновляем локальное состояние
      const itemIndex = items.value.findIndex(
        item => item.productId === params.productId && 
                item.providerId === params.providerId && 
                item.departmentId === params.departmentId
      )

      if (itemIndex !== -1) {
        items.value[itemIndex].amount = params.amount
        items.value[itemIndex].totalPrice = params.amount * items.value[itemIndex].price
        if (items.value[itemIndex].discountPrice) {
          items.value[itemIndex].totalDiscountPrice = params.amount * items.value[itemIndex].discountPrice!
        }
      }

      updateDetails()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при обновлении товара в корзине'
      return false
    } finally {
      loading.value = false
    }
  }

  const removeFromCart = async (itemsToRemove: CartItem[]): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await cartService.removeFromCart(itemsToRemove)
      
      // Обновляем локальное состояние
      const idsToRemove = itemsToRemove.map(item => item.productId)
      items.value = items.value.filter(item => !idsToRemove.includes(item.productId))

      updateDetails()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при удалении товаров из корзины'
      return false
    } finally {
      loading.value = false
    }
  }

  const clearCart = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await cartService.clearCart()
      items.value = []
      updateDetails()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при очистке корзины'
      return false
    } finally {
      loading.value = false
    }
  }

  const reAddProduct = async (productId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await cartService.reAddProductToCart(productId)
      
      if (response.status === 'error') {
        error.value = response.message || 'Ошибка при повторном добавлении товара'
        return false
      }

      // Обновляем корзину после успешного добавления
      await fetchCart()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при повторном добавлении товара'
      return false
    } finally {
      loading.value = false
    }
  }

  const reAddOrder = async (orderId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await cartService.reAddOrderToCart(orderId)
      
      if (response.status === 'error') {
        error.value = response.message || 'Ошибка при повторном добавлении заказа'
        return false
      }

      // Обновляем корзину после успешного добавления
      await fetchCart()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при повторном добавлении заказа'
      return false
    } finally {
      loading.value = false
    }
  }

  const checkWeight = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const params = {
        products: items.value.map(item => ({
          productId: item.productId,
          providerId: item.providerId,
          departmentId: item.departmentId,
          amount: item.amount
        }))
      }

      const response = await cartService.checkWeight(params)
      
      // Обрабатываем предупреждения о превышении веса
      if (response.length > 0) {
        response.forEach(warning => {
          if (warning.overWeight) {
            console.warn(`На филиале ${warning.departmentName}, превышен лимит веса на ${warning.overWeight} кг из ${warning.limit}. Доставка будет только до подъезда.`)
          }
        })
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при проверке веса'
      return false
    } finally {
      loading.value = false
    }
  }

  // Утилиты
  const updateDetails = () => {
    details.value = cartService.calculateCartDetails(items.value)
  }

  const addAyanPacket = (departmentId: number, departmentName: string): CartItem | null => {
    const packet = cartService.addAyanPacket(items.value, departmentId, departmentName)
    if (packet) {
      items.value.push(packet)
      updateDetails()
    }
    return packet
  }

  const shouldAddPacket = (): boolean => {
    return cartService.shouldAddPacket(items.value)
  }

  const shouldRemovePacket = (): boolean => {
    return cartService.shouldRemovePacket(items.value)
  }

  const clearError = () => {
    error.value = null
  }

  const getItemById = (productId: string, providerId: string, departmentId: string): CartItem | undefined => {
    return items.value.find(
      item => item.productId === productId && 
              item.providerId === providerId && 
              item.departmentId === departmentId
    )
  }

  const getItemQuantity = (productId: string, providerId: string, departmentId: string): number => {
    const item = getItemById(productId, providerId, departmentId)
    return item?.amount || 0
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    items: readonly(items),
    details: readonly(details),
    
    // Вычисляемые свойства
    isEmpty,
    hasItems,
    totalItems,
    totalAmount,
    totalPrice,
    ayanItems,
    regularItems,
    
    // Методы
    fetchCart,
    addToCart,
    updateItem,
    removeFromCart,
    clearCart,
    reAddProduct,
    reAddOrder,
    checkWeight,
    addAyanPacket,
    shouldAddPacket,
    shouldRemovePacket,
    clearError,
    getItemById,
    getItemQuantity
  }
}
