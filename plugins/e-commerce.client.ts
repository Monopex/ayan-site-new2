/**
 * E-commerce плагин для Google Tag Manager
 */
export default defineNuxtPlugin(() => {
  const { $gtm } = useNuxtApp()

  // Проверка валидности домена
  const isValidDomain = (): boolean => {
    if (process.client) {
      const host = window.location.host
      return host === 'www.ayanmarket.kz' || host === 'ayanmarket.kz'
    }
    return false
  }

  // Сериализация продуктов для GTM
  const serializeProducts = (products: any[]): any[] => {
    return products.map(product => ({
      item_id: product.productId,
      item_name: product.productName,
      price: product.totalPrice || product.price,
      item_category: product.categoryId,
      item_list_id: product.categoryId,
      quantity: parseFloat(product.amount || 0),
      affiliation: product.departmentName
    }))
  }

  // E-commerce объект
  const ecommerce = {
    /**
     * Добавление товара в корзину
     */
    addToCart: (data: any) => {
      if (!isValidDomain()) return
      
      $gtm?.push({ ecommerce: null })
      const productsList = serializeProducts([data])
      $gtm?.push({
        event: 'add_to_cart',
        ecommerce: {
          items: productsList
        }
      })
    },

    /**
     * Удаление товара из корзины
     */
    removeFromCart: (data: any) => {
      if (!isValidDomain()) return
      
      $gtm?.push({ ecommerce: null })
      const productsList = serializeProducts([data])
      $gtm?.push({
        event: 'remove_from_cart',
        ecommerce: {
          items: productsList
        }
      })
    },

    /**
     * Оформление заказа
     */
    purchase: (eventObj: any) => {
      if (!isValidDomain()) return
      
      const productsList = serializeProducts(eventObj.products)
      const totalValue = eventObj.products.reduce((acc: number, item: any) => {
        return acc + (item.totalDiscountPrice 
          ? parseFloat(item.totalDiscountPrice) 
          : parseFloat(item.totalPrice) || parseFloat(item.price) * parseFloat(item.amount))
      }, 0)
      
      $gtm?.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: eventObj.orderId,
          affiliation: 'Website',
          currency: 'KZT',
          value: totalValue,
          shipping: 0.00,
          payment_type: eventObj.payment_type,
          items: productsList
        }
      })
    },

    /**
     * Отправка страницы
     */
    sendPage: (city: string, pageType: string, categoryName?: string) => {
      if (!isValidDomain()) return
      
      const eventObject = {
        userСity: city,
        pageType,
        categoryName
      }
      $gtm?.push(eventObject)
    },

    /**
     * Авторизация пользователя
     */
    authorization: (userId: any) => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'authorization',
        userId
      })
    },

    /**
     * Открытие окна авторизации
     */
    authorizationOpen: () => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'GAEvent',
        eCategory: 'user',
        eAction: 'auth',
        eLabel: 'open'
      })
    },

    /**
     * Успешная авторизация
     */
    authorizationComplete: () => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'GAEvent',
        eCategory: 'user',
        eAction: 'auth',
        eLabel: 'complete'
      })
    },

    /**
     * Клик по телефону
     */
    phoneClick: () => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'GAEvent',
        eCategory: 'phoneButton',
        eAction: 'click',
        eLabel: ''
      })
    },

    /**
     * Клик по email
     */
    emailClick: (email: string) => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'GAEvent',
        eCategory: 'externalLink',
        eAction: 'click',
        eLabel: `mailto: ${email}`
      })
    },

    /**
     * Просмотр списка товаров
     */
    viewItemList: (products: any[]) => {
      if (!isValidDomain()) return
      
      const items = products.map(p => {
        const price = p.priceMap 
          ? Object.values(p.priceMap)[0]?.price ?? null 
          : null
        
        const cat = p.categoryId ?? 
          (Array.isArray(p.categoryIds) && p.categoryIds.length 
            ? p.categoryIds[0] 
            : null)
        
        return {
          item_id: p.providerProductId,
          item_name: p.name,
          price,
          item_category: cat,
          item_list_id: cat
        }
      })
      
      $gtm?.push({
        event: 'view_item_list',
        ecommerce: { items }
      })
    },

    /**
     * Клик по товару
     */
    selectItem: (product: any) => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'select_item',
        ecommerce: {
          items: [product]
        }
      })
    },

    /**
     * Просмотр товара
     */
    viewItem: (product: any) => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'view_item',
        ecommerce: {
          items: [product]
        }
      })
    },

    /**
     * Добавление в избранное
     */
    addToWishlist: (item: any) => {
      if (!isValidDomain()) return
      
      $gtm?.push({
        event: 'add_to_wishlist',
        ecommerce: {
          items: [item]
        }
      })
    },

    /**
     * Просмотр корзины
     */
    viewCart: (products: any[]) => {
      if (!isValidDomain()) return
      
      const productsList = serializeProducts(products)
      $gtm?.push({
        event: 'view_cart',
        ecommerce: {
          items: productsList
        }
      })
    },

    /**
     * Просмотр страницы оформления
     */
    beginCheckout: (products: any[]) => {
      if (!isValidDomain()) return
      
      const productsList = serializeProducts(products)
      $gtm?.push({
        event: 'begin_checkout',
        ecommerce: {
          items: productsList
        }
      })
    },

    /**
     * Выбор способа оплаты
     */
    addPaymentInfo: (eventObj: any) => {
      if (!isValidDomain()) return
      
      const productsList = serializeProducts(eventObj.products)
      $gtm?.push({
        event: 'add_payment_info',
        ecommerce: {
          payment_type: eventObj.payment_type,
          items: productsList
        }
      })
    }
  }

  // Инжектим в приложение
  return {
    provide: {
      ecommerce
    }
  }
})
