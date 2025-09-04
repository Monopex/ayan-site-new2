/**
 * Плагин для работы с localStorage и sessionStorage
 */
export default defineNuxtPlugin(() => {
  // Простые функции для работы с localStorage
  const local = {
    set: (key: string, value: any) => {
      if (process.client) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error('Ошибка записи в localStorage:', error)
        }
      }
    },
    
    get: (key: string) => {
      if (process.client) {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch (error) {
          console.error('Ошибка чтения из localStorage:', error)
          return null
        }
      }
      return null
    },
    
    remove: (key: string) => {
      if (process.client) {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Ошибка удаления из localStorage:', error)
        }
      }
    },
    
    clear: () => {
      if (process.client) {
        try {
          localStorage.clear()
        } catch (error) {
          console.error('Ошибка очистки localStorage:', error)
        }
      }
    }
  }

  // Простые функции для работы с sessionStorage
  const session = {
    set: (key: string, value: any) => {
      if (process.client) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error('Ошибка записи в sessionStorage:', error)
        }
      }
    },
    
    get: (key: string) => {
      if (process.client) {
        try {
          const item = sessionStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch (error) {
          console.error('Ошибка чтения из sessionStorage:', error)
          return null
        }
      }
      return null
    },
    
    remove: (key: string) => {
      if (process.client) {
        try {
          sessionStorage.removeItem(key)
        } catch (error) {
          console.error('Ошибка удаления из sessionStorage:', error)
        }
      }
    },
    
    clear: () => {
      if (process.client) {
        try {
          sessionStorage.clear()
        } catch (error) {
          console.error('Ошибка очистки sessionStorage:', error)
        }
      }
    }
  }

  // Инжектим в приложение
  return {
    provide: {
      local,
      session
    }
  }
})
