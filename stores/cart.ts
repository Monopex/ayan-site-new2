import { defineStore } from 'pinia'
import { CartService } from '~/composables/api'

export interface CartItem {
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
  forPacket?: boolean
  packetStep?: number
}

export interface CartDetails {
  totalAmount: number
  totalPrice: number
  totalLength: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const details = ref<CartDetails>({
    totalAmount: 0,
    totalPrice: 0,
    totalLength: 0
  })

  // Services
  const cartService = new CartService()

  // Getters
  const cartItems = computed(() => items.value)
  const cartDetails = computed(() => details.value)
  const isEmpty = computed(() => items.value.length === 0)
  const totalItems = computed(() => details.value.totalLength)
  const totalPrice = computed(() => details.value.totalPrice)
  const totalAmount = computed(() => details.value.totalAmount)

  // Actions
  const getClientCart = async (params: { clientId: string; departmentIds: number[] }) => {
    try {
      const data = await cartService.getClientCart(params)
      setAllProductsInCart(data)
      updateCartDetails()
      return data
    } catch (error) {
      console.error('Ошибка получения корзины:', error)
      throw error
    }
  }

  const addToCart = async (item: CartItem) => {
    try {
      // Вычисляем общую цену
      item.totalPrice = Math.floor(+item.amount * item.price)
      item.totalDiscountPrice = item.discountPrice
        ? Math.floor(+item.amount * item.discountPrice)
        : null

      // Добавляем в локальное состояние
      setNewAddedProduct(JSON.parse(JSON.stringify(item)))
      updateCartDetails()

      // Отправляем на сервер если авторизованы
      const token = useCookie('TOKEN').value
      if (token) {
        await cartService.addToCart(item)
      }

      // Добавляем пакет если нужно
      addPacket(item)

      return true
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
      throw error
    }
  }

  const updateCartItem = async (params: {
    productId: string
    providerId: string
    departmentId: string
    amount: number
  }) => {
    try {
      const response = await cartService.updateCartItem(params)
      
      // Обновляем локальное состояние
      newAmount({
        productId: params.productId,
        providerId: params.providerId,
        departmentId: params.departmentId,
        amount: params.amount
      })

      return response
    } catch (error) {
      console.error('Ошибка обновления товара в корзине:', error)
      throw error
    }
  }

  const removeFromCart = async (itemsToRemove: CartItem[]) => {
    try {
      const oldProducts = items.value.filter(p => 
        itemsToRemove.some(removeItem => removeItem.productId === p.productId)
      )

      // Удаляем из локального состояния
      oldProducts.forEach(product => {
        removeProduct(product.productId)
        if (product.departmentIsAyan) {
          addPacket(product)
        }
      })

      updateCartDetails()

      // Отправляем на сервер если авторизованы
      const token = useCookie('TOKEN').value
      if (token) {
        await cartService.removeFromCart(itemsToRemove)
      }

      return true
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error)
      throw error
    }
  }

  const clearCart = async () => {
    try {
      setClearedCartProducts()
      updateCartDetails()

      // Отправляем на сервер если авторизованы
      const token = useCookie('TOKEN').value
      if (token) {
        await cartService.clearCart()
      }

      return true
    } catch (error) {
      console.error('Ошибка очистки корзины:', error)
      throw error
    }
  }

  const reAddProductToCart = async (productId: string) => {
    try {
      const response = await cartService.reAddProductToCart(productId)
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Ошибка повторного добавления товара')
      }

      // Обновляем корзину
      const clientId = useCookie('clientId').value
      const departmentIds = useCookie('availableDepartments').value || []
      
      if (clientId && departmentIds) {
        await getClientCart({ clientId, departmentIds })
      }

      return response
    } catch (error) {
      console.error('Ошибка повторного добавления товара:', error)
      throw error
    }
  }

  const reAddOrderToCart = async (orderId: string) => {
    try {
      const response = await cartService.reAddOrderToCart(orderId)
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Ошибка повторного добавления заказа')
      }

      // Обновляем корзину
      const clientId = useCookie('clientId').value
      const departmentIds = useCookie('availableDepartments').value || []
      
      if (clientId && departmentIds) {
        await getClientCart({ clientId, departmentIds })
      }

      return response
    } catch (error) {
      console.error('Ошибка повторного добавления заказа:', error)
      throw error
    }
  }

  const checkWeight = async (products: Array<{
    productId: string
    providerId: string
    departmentId: string
    amount: number
  }>) => {
    try {
      const response = await cartService.checkWeight({ products })
      return response
    } catch (error) {
      console.error('Ошибка проверки веса:', error)
      throw error
    }
  }

  // Mutations (локальные изменения состояния)
  const setAllProductsInCart = (data: CartItem[] | { data: CartItem[] } | { products: CartItem[] } | CartItem) => {
    if (Array.isArray(data)) {
      items.value = data
    } else if (data && 'data' in data && Array.isArray(data.data)) {
      items.value = data.data
    } else if (data && 'products' in data && Array.isArray(data.products)) {
      items.value = data.products
    } else if (data && typeof data === 'object') {
      items.value = [data as CartItem]
    } else {
      items.value = []
    }
  }

  const setNewAddedProduct = (data: CartItem) => {
    const index = items.value.findIndex(item => item.productId === data.productId)
    if (index !== -1) {
      items.value.splice(index, 1, data)
    } else {
      items.value.push(data)
    }
  }

  const removeProduct = (productId: string) => {
    items.value = items.value.filter(product => product.productId !== productId)
  }

  const setClearedCartProducts = () => {
    items.value = []
  }

  const updateCartDetails = () => {
    const cartItems = items.value
    let amount = 0
    let price = 0

    for (let i = 0; i < cartItems.length; i++) {
      amount = amount + parseFloat((cartItems[i].amount || 0).toString())
      const unitPrice = cartItems[i].price != null ? cartItems[i].price : cartItems[i].totalPrice || 0
      price = parseFloat(price.toString()) + parseFloat((cartItems[i].amount || 0).toString()) * parseFloat(unitPrice.toString())
    }

    details.value = {
      totalAmount: amount,
      totalPrice: Math.ceil(price),
      totalLength: cartItems.length
    }
  }

  const newAmount = (input: {
    productId: string
    providerId: string
    departmentId: string
    amount: number
  }) => {
    const product = items.value.find(
      product => product.productId === input.productId
    )

    if (product && product.productId === input.productId && 
        product.providerId === input.providerId && 
        product.departmentId === input.departmentId) {
      
      const oldProductData = JSON.parse(JSON.stringify(product))
      const amount = parseFloat(input.amount.toString())
      
      oldProductData.amount = parseFloat(input.amount.toString())
      oldProductData.totalPrice = Math.floor(+input.amount * oldProductData.price)
      oldProductData.totalDiscountPrice = oldProductData.discountPrice
        ? Math.floor(+input.amount * oldProductData.discountPrice)
        : null

      setNewAddedProduct(oldProductData)
      updateCartDetails()

      if (oldProductData.departmentIsAyan && !input.forPacket) {
        addPacket(oldProductData)
      }
    }
  }

  const addPacket = (input: CartItem) => {
    let amountPacket = 1
    const price = items.value.reduce((acc, product) => {
      if (product.departmentIsAyan) {
        acc += product.totalDiscountPrice || product.totalPrice
      }
      return acc
    }, 0)

    if (input?.packetStep && price > input?.packetStep) {
      const amount = price / input.packetStep
      if (amount > 1) {
        amountPacket = Math.floor(amount) + 1
      }
    }

    let providerId = 2435
    if (input.departmentId === '35') {
      providerId = 2431
    }

    const packet: CartItem = {
      productId: '748749',
      providerId: providerId.toString(),
      departmentId: input.departmentId,
      amount: amountPacket,
      price: 16,
      totalPrice: amountPacket * 16,
      productName: 'ПАКЕТ АЯН',
      productNameKz: 'ПАКЕТ АЯН',
      measureType: 'шт',
      amountStep: 1,
      departmentName: input.departmentName,
      departmentIsAyan: true,
      categoryId: '303',
      balance: 1000,
      forPacket: true
    }

    const inCart = items.value.some(
      product => product.productId === packet.productId
    )

    if (inCart && items.value.length === 1) {
      setClearedCartProducts()
      updateCartDetails()
      return
    }

    const isOnlyAyanPacket = items.value.filter(product => product.departmentIsAyan).length === 1

    if (inCart && isOnlyAyanPacket) {
      removeProduct('748749')
      return
    }

    if (inCart) {
      newAmount(packet)
    } else if (input.departmentIsAyan) {
      packet.totalPrice = amountPacket * packet.price
      setNewAddedProduct(packet)
    }
  }

  return {
    // State
    items: readonly(items),
    details: readonly(details),
    
    // Getters
    cartItems,
    cartDetails,
    isEmpty,
    totalItems,
    totalPrice,
    totalAmount,
    
    // Actions
    getClientCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    reAddProductToCart,
    reAddOrderToCart,
    checkWeight,
    updateCartDetails,
    newAmount,
    addPacket
  }
})
