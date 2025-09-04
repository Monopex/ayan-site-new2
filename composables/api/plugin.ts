// Nuxt plugin для инициализации API
export default defineNuxtPlugin(() => {
  // Инициализация API клиента при старте приложения
  const { $api } = useNuxtApp()
  
  // Здесь можно добавить глобальную инициализацию API
  // Например, настройка interceptors, обработка ошибок и т.д.
  
  return {
    provide: {
      api: {
        // Экспортируем основные composables для глобального использования
        useAuth: () => import('./composables/useAuth').then(m => m.useAuth),
        useProducts: () => import('./composables/useProducts').then(m => m.useProducts),
        useCart: () => import('./composables/useCart').then(m => m.useCart),
        useGeo: () => import('./composables/useGeo').then(m => m.useGeo),
        useOrders: () => import('./composables/useOrders').then(m => m.useOrders)
      }
    }
  }
})
