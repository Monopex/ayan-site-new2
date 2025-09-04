/**
 * Плагин для работы с Mindbox (система лояльности)
 */
export default defineNuxtPlugin(() => {
  // Инициализация Mindbox
  const initMindbox = () => {
    if (process.client) {
      // 1) Отключаем автоматическое слежение PopMechanic за сменой URL
      window.PopMechanic = { watchLocation: false }

      // 2) Stub и очередь для mindbox до того, как SDK загрузится
      window.mindbox = window.mindbox || function () {
        // (пушим аргументы в очередь)
        (window.mindbox.queue = window.mindbox.queue || []).push(arguments)
      }
      window.mindbox.queue = window.mindbox.queue || []

      // 3) Инициализируем точку интеграции
      window.mindbox('create', {
        endpointId: 'ayan.website'
      })

      // 4) Динамически подгружаем сам SDK трекера
      const script = document.createElement('script')
      script.src = 'https://api.s.mindbox.ru/scripts/v1/tracker.js'
      script.async = true

      script.onload = () => {
        console.log('[mindbox] tracker.js loaded')
      }
      script.onerror = () => {
        console.error('[mindbox] failed to load tracker.js')
      }

      document.head.appendChild(script)
    }
  }

  // Функция для асинхронных операций с Mindbox
  const mbAsync = ({ operation, data, onSuccess, onError }: {
    operation: string
    data?: any
    onSuccess?: (response: any) => void
    onError?: (error: any) => void
  }) => {
    if (!process.client || typeof window.mindbox !== 'function') {
      console.warn('[MB] SDK not ready')
      return
    }

    // Получаем UUID устройства
    const { getOrCreateDeviceUuid } = useDeviceUuid()
    const uuid = getOrCreateDeviceUuid()

    // Устанавливаем заголовки запроса
    window.mindbox('setRequestHeaders', {
      'X-Device-UUID': uuid,
      'X-Device-Type': 'site'
    })

    // Отправляем запрос
    window.mindbox('async', {
      operation,
      data,
      onSuccess,
      onError
    })
  }

  // Предустановленные операции для отслеживания
  const tracking = {
    // Просмотр товара
    productViewed: (productId: string, productData?: any) => {
      mbAsync({
        operation: 'Product.Viewed',
        data: {
          productId,
          ...productData
        }
      })
    },

    // Добавление товара в корзину
    productAddedToCart: (productId: string, quantity: number, productData?: any) => {
      mbAsync({
        operation: 'Cart.Added',
        data: {
          productId,
          quantity,
          ...productData
        }
      })
    },

    // Удаление товара из корзины
    productRemovedFromCart: (productId: string, quantity: number, productData?: any) => {
      mbAsync({
        operation: 'Cart.Removed',
        data: {
          productId,
          quantity,
          ...productData
        }
      })
    },

    // Очистка корзины
    cartCleared: () => {
      mbAsync({
        operation: 'Cart.Cleared'
      })
    },

    // Просмотр корзины
    cartViewed: (cartData?: any) => {
      mbAsync({
        operation: 'Cart.Viewed',
        data: cartData
      })
    },

    // Начало оформления заказа
    checkoutStarted: (checkoutData?: any) => {
      mbAsync({
        operation: 'Checkout.Started',
        data: checkoutData
      })
    },

    // Завершение заказа
    orderCompleted: (orderId: string, orderData?: any) => {
      mbAsync({
        operation: 'Order.Completed',
        data: {
          orderId,
          ...orderData
        }
      })
    },

    // Отмена заказа
    orderCancelled: (orderId: string, reason?: string) => {
      mbAsync({
        operation: 'Order.Cancelled',
        data: {
          orderId,
          reason
        }
      })
    },

    // Регистрация пользователя
    userRegistered: (userId: string, userData?: any) => {
      mbAsync({
        operation: 'User.Registered',
        data: {
          userId,
          ...userData
        }
      })
    },

    // Вход пользователя
    userLoggedIn: (userId: string, userData?: any) => {
      mbAsync({
        operation: 'User.LoggedIn',
        data: {
          userId,
          ...userData
        }
      })
    },

    // Выход пользователя
    userLoggedOut: (userId: string) => {
      mbAsync({
        operation: 'User.LoggedOut',
        data: {
          userId
        }
      })
    },

    // Просмотр категории
    categoryViewed: (categoryId: string, categoryData?: any) => {
      mbAsync({
        operation: 'Category.Viewed',
        data: {
          categoryId,
          ...categoryData
        }
      })
    },

    // Поиск
    searchPerformed: (query: string, resultsCount?: number) => {
      mbAsync({
        operation: 'Search.Performed',
        data: {
          query,
          resultsCount
        }
      })
    }
  }

  // Инициализируем Mindbox
  initMindbox()

  // Инжектим в приложение
  return {
    provide: {
      mbAsync,
      tracking
    }
  }
})
