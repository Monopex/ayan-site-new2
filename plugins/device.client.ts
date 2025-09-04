/**
 * Плагин для работы с устройством и браузером
 */
export default defineNuxtPlugin(() => {
  // Определение типа устройства
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (process.client) {
      const width = window.innerWidth
      if (width < 768) return 'mobile'
      if (width < 1024) return 'tablet'
      return 'desktop'
    }
    return 'desktop'
  }

  // Определение операционной системы
  const getOS = (): string => {
    if (process.client) {
      const userAgent = navigator.userAgent
      if (userAgent.includes('Windows')) return 'Windows'
      if (userAgent.includes('Mac')) return 'macOS'
      if (userAgent.includes('Linux')) return 'Linux'
      if (userAgent.includes('Android')) return 'Android'
      if (userAgent.includes('iOS')) return 'iOS'
      return 'Unknown'
    }
    return 'Unknown'
  }

  // Определение браузера
  const getBrowser = (): string => {
    if (process.client) {
      const userAgent = navigator.userAgent
      if (userAgent.includes('Chrome')) return 'Chrome'
      if (userAgent.includes('Firefox')) return 'Firefox'
      if (userAgent.includes('Safari')) return 'Safari'
      if (userAgent.includes('Edge')) return 'Edge'
      if (userAgent.includes('Opera')) return 'Opera'
      return 'Unknown'
    }
    return 'Unknown'
  }

  // Проверка поддержки touch
  const isTouchDevice = (): boolean => {
    if (process.client) {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    return false
  }

  // Проверка поддержки геолокации
  const isGeolocationSupported = (): boolean => {
    if (process.client) {
      return 'geolocation' in navigator
    }
    return false
  }

  // Проверка поддержки localStorage
  const isLocalStorageSupported = (): boolean => {
    if (process.client) {
      try {
        const test = 'test'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    }
    return false
  }

  // Проверка поддержки sessionStorage
  const isSessionStorageSupported = (): boolean => {
    if (process.client) {
      try {
        const test = 'test'
        sessionStorage.setItem(test, test)
        sessionStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    }
    return false
  }

  // Получение разрешения экрана
  const getScreenResolution = (): { width: number; height: number } => {
    if (process.client) {
      return {
        width: window.screen.width,
        height: window.screen.height
      }
    }
    return { width: 0, height: 0 }
  }

  // Получение размера окна
  const getWindowSize = (): { width: number; height: number } => {
    if (process.client) {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
    return { width: 0, height: 0 }
  }

  // Проверка, является ли устройство мобильным
  const isMobile = (): boolean => {
    return getDeviceType() === 'mobile'
  }

  // Проверка, является ли устройство планшетом
  const isTablet = (): boolean => {
    return getDeviceType() === 'tablet'
  }

  // Проверка, является ли устройство десктопом
  const isDesktop = (): boolean => {
    return getDeviceType() === 'desktop'
  }

  // Проверка, является ли устройство iOS
  const isIOS = (): boolean => {
    return getOS() === 'iOS'
  }

  // Проверка, является ли устройство Android
  const isAndroid = (): boolean => {
    return getOS() === 'Android'
  }

  // Проверка, является ли браузер Safari
  const isSafari = (): boolean => {
    return getBrowser() === 'Safari'
  }

  // Проверка, является ли браузер Chrome
  const isChrome = (): boolean => {
    return getBrowser() === 'Chrome'
  }

  // Проверка, является ли браузер Firefox
  const isFirefox = (): boolean => {
    return getBrowser() === 'Firefox'
  }

  // Получение информации об устройстве
  const getDeviceInfo = () => {
    return {
      type: getDeviceType(),
      os: getOS(),
      browser: getBrowser(),
      isTouch: isTouchDevice(),
      isGeolocationSupported: isGeolocationSupported(),
      isLocalStorageSupported: isLocalStorageSupported(),
      isSessionStorageSupported: isSessionStorageSupported(),
      screenResolution: getScreenResolution(),
      windowSize: getWindowSize()
    }
  }

  // Инжектим в приложение
  return {
    provide: {
      getDeviceType,
      getOS,
      getBrowser,
      isTouchDevice,
      isGeolocationSupported,
      isLocalStorageSupported,
      isSessionStorageSupported,
      getScreenResolution,
      getWindowSize,
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      getDeviceInfo
    }
  }
})
