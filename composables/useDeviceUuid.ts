/**
 * Composable для работы с UUID устройства
 */
export const useDeviceUuid = () => {
  // Получение или создание UUID устройства
  const getOrCreateDeviceUuid = (): string => {
    if (process.client) {
      const { getCookie, setCookie } = useNuxtApp()
      
      // Пытаемся получить существующий UUID
      let uuid = getCookie('deviceUuid')
      
      if (!uuid) {
        // Создаем новый UUID
        uuid = generateUUID()
        
        // Сохраняем в cookies на 1 год
        setCookie('deviceUuid', uuid, {
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
      
      return uuid
    }
    
    return ''
  }

  // Генерация UUID v4
  const generateUUID = (): string => {
    if (process.client && window.crypto && window.crypto.getRandomValues) {
      // Используем crypto API если доступно
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    } else {
      // Fallback для старых браузеров
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }

  // Получение информации об устройстве
  const getDeviceInfo = () => {
    if (process.client) {
      const { getDeviceType, getOS, getBrowser } = useNuxtApp()
      
      return {
        uuid: getOrCreateDeviceUuid(),
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: {
          width: window.screen.width,
          height: window.screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    }
    
    return {
      uuid: '',
      type: 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      userAgent: '',
      language: 'ru',
      timezone: 'Europe/Moscow',
      screenResolution: { width: 0, height: 0 },
      viewport: { width: 0, height: 0 }
    }
  }

  // Проверка, является ли устройство мобильным
  const isMobile = (): boolean => {
    if (process.client) {
      return window.innerWidth < 768
    }
    return false
  }

  // Проверка, является ли устройство планшетом
  const isTablet = (): boolean => {
    if (process.client) {
      return window.innerWidth >= 768 && window.innerWidth < 1024
    }
    return false
  }

  // Проверка, является ли устройство десктопом
  const isDesktop = (): boolean => {
    if (process.client) {
      return window.innerWidth >= 1024
    }
    return true
  }

  return {
    getOrCreateDeviceUuid,
    generateUUID,
    getDeviceInfo,
    isMobile,
    isTablet,
    isDesktop
  }
}
