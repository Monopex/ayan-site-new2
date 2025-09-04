/**
 * Плагин для работы с Pinia persistence
 */
export default defineNuxtPlugin(() => {
  // Конфигурация для разных типов данных
  const persistConfig = {
    // Обычное сохранение (как в vuex-persist)
    normal: {
      key: 'pinia-persist',
      paths: [
        'cart', // Сохранение состояния корзины
        'geo', // Сохранение геолокации
        'categories' // Сохранение категорий
      ]
    },
    
    // Безопасное сохранение (как в vuex-secure-persist)
    secure: {
      key: 'pinia-secure-persist',
      paths: [
        { keys: ['personal'], ttl: 1000 * 60 * 60 * 24 }, // 1 день
        { keys: ['orders'], ttl: 1000 * 60 * 1 } // 1 час
      ]
    }
  }

  // Функция для получения данных из localStorage
  const getStoredData = (key: string): any => {
    if (process.client) {
      try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
      } catch (error) {
        console.error('Ошибка чтения данных из localStorage:', error)
        return null
      }
    }
    return null
  }

  // Функция для сохранения данных в localStorage
  const setStoredData = (key: string, data: any): void => {
    if (process.client) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error('Ошибка записи данных в localStorage:', error)
      }
    }
  }

  // Функция для удаления данных из localStorage
  const removeStoredData = (key: string): void => {
    if (process.client) {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error('Ошибка удаления данных из localStorage:', error)
      }
    }
  }

  // Функция для получения безопасных данных
  const getSecureData = (key: string): any => {
    if (process.client) {
      try {
        const data = localStorage.getItem(key)
        if (!data) return null
        
        const parsed = JSON.parse(data)
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem(key)
          return null
        }
        
        return parsed.value
      } catch (error) {
        console.error('Ошибка чтения безопасных данных:', error)
        return null
      }
    }
    return null
  }

  // Функция для сохранения безопасных данных
  const setSecureData = (key: string, data: any, ttl: number): void => {
    if (process.client) {
      try {
        const secureData = {
          value: data,
          expiresAt: Date.now() + ttl
        }
        localStorage.setItem(key, JSON.stringify(secureData))
      } catch (error) {
        console.error('Ошибка записи безопасных данных:', error)
      }
    }
  }

  // Функция для восстановления состояния store
  const restoreStoreState = (store: any, paths: string[]): void => {
    if (process.client) {
      const storedData = getStoredData(persistConfig.normal.key)
      if (storedData) {
        paths.forEach(path => {
          if (storedData[path]) {
            store[path] = storedData[path]
          }
        })
      }
    }
  }

  // Функция для восстановления безопасного состояния store
  const restoreSecureStoreState = (store: any, path: string, ttl: number): void => {
    if (process.client) {
      const key = `${persistConfig.secure.key}:${path}`
      const storedData = getSecureData(key)
      if (storedData) {
        store[path] = storedData
      }
    }
  }

  // Функция для сохранения состояния store
  const saveStoreState = (store: any, paths: string[]): void => {
    if (process.client) {
      const dataToSave: Record<string, any> = {}
      paths.forEach(path => {
        if (store[path] !== undefined) {
          dataToSave[path] = store[path]
        }
      })
      setStoredData(persistConfig.normal.key, dataToSave)
    }
  }

  // Функция для сохранения безопасного состояния store
  const saveSecureStoreState = (store: any, path: string, ttl: number): void => {
    if (process.client) {
      const key = `${persistConfig.secure.key}:${path}`
      if (store[path] !== undefined) {
        setSecureData(key, store[path], ttl)
      }
    }
  }

  // Функция для очистки всех сохраненных данных
  const clearAllPersistedData = (): void => {
    if (process.client) {
      // Очищаем обычные данные
      removeStoredData(persistConfig.normal.key)
      
      // Очищаем безопасные данные
      persistConfig.secure.paths.forEach(({ keys }) => {
        keys.forEach(key => {
          const storageKey = `${persistConfig.secure.key}:${key}`
          removeStoredData(storageKey)
        })
      })
    }
  }

  // Функция для очистки конкретного пути
  const clearPersistedPath = (path: string): void => {
    if (process.client) {
      const storedData = getStoredData(persistConfig.normal.key)
      if (storedData && storedData[path]) {
        delete storedData[path]
        setStoredData(persistConfig.normal.key, storedData)
      }
    }
  }

  // Функция для очистки безопасного пути
  const clearSecurePersistedPath = (path: string): void => {
    if (process.client) {
      const key = `${persistConfig.secure.key}:${path}`
      removeStoredData(key)
    }
  }

  // Функция для проверки существования данных
  const hasPersistedData = (path: string): boolean => {
    if (process.client) {
      const storedData = getStoredData(persistConfig.normal.key)
      return storedData && storedData[path] !== undefined
    }
    return false
  }

  // Функция для проверки существования безопасных данных
  const hasSecurePersistedData = (path: string): boolean => {
    if (process.client) {
      const key = `${persistConfig.secure.key}:${path}`
      return getSecureData(key) !== null
    }
    return false
  }

  // Инжектим в приложение
  return {
    provide: {
      // Основные функции
      restoreStoreState,
      restoreSecureStoreState,
      saveStoreState,
      saveSecureStoreState,
      
      // Утилиты
      clearAllPersistedData,
      clearPersistedPath,
      clearSecurePersistedPath,
      hasPersistedData,
      hasSecurePersistedData,
      
      // Конфигурация
      persistConfig
    }
  }
})
