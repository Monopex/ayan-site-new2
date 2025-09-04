/**
 * Плагин для работы с cookies
 */
export default defineNuxtPlugin(() => {
  // Установка cookie
  const setCookie = (
    name: string, 
    value: string, 
    options: {
      expires?: Date | number
      path?: string
      domain?: string
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
      httpOnly?: boolean
    } = {}
  ): void => {
    if (process.client) {
      let cookieString = `${name}=${encodeURIComponent(value)}`
      
      if (options.expires) {
        const expires = options.expires instanceof Date 
          ? options.expires 
          : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000)
        cookieString += `; expires=${expires.toUTCString()}`
      }
      
      if (options.path) {
        cookieString += `; path=${options.path}`
      }
      
      if (options.domain) {
        cookieString += `; domain=${options.domain}`
      }
      
      if (options.secure) {
        cookieString += '; secure'
      }
      
      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`
      }
      
      if (options.httpOnly) {
        cookieString += '; httponly'
      }
      
      document.cookie = cookieString
    }
  }

  // Получение cookie
  const getCookie = (name: string): string | null => {
    if (process.client) {
      const nameEQ = name + '='
      const ca = document.cookie.split(';')
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length))
        }
      }
    }
    return null
  }

  // Удаление cookie
  const removeCookie = (name: string, options: { path?: string; domain?: string } = {}): void => {
    if (process.client) {
      setCookie(name, '', {
        ...options,
        expires: new Date(0)
      })
    }
  }

  // Проверка существования cookie
  const hasCookie = (name: string): boolean => {
    return getCookie(name) !== null
  }

  // Получение всех cookies
  const getAllCookies = (): Record<string, string> => {
    if (process.client) {
      const cookies: Record<string, string> = {}
      const ca = document.cookie.split(';')
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        const eqPos = c.indexOf('=')
        if (eqPos > 0) {
          const name = c.substring(0, eqPos)
          const value = c.substring(eqPos + 1)
          cookies[name] = decodeURIComponent(value)
        }
      }
      
      return cookies
    }
    return {}
  }

  // Очистка всех cookies
  const clearAllCookies = (): void => {
    if (process.client) {
      const cookies = getAllCookies()
      Object.keys(cookies).forEach(name => {
        removeCookie(name)
      })
    }
  }

  // Установка cookie с JSON значением
  const setCookieJSON = (name: string, value: any, options?: any): void => {
    setCookie(name, JSON.stringify(value), options)
  }

  // Получение cookie с JSON значением
  const getCookieJSON = (name: string): any => {
    const value = getCookie(name)
    if (value) {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return null
  }

  // Установка cookie с TTL (время жизни в секундах)
  const setCookieTTL = (name: string, value: string, ttl: number, options?: any): void => {
    setCookie(name, value, {
      ...options,
      expires: ttl
    })
  }

  // Установка cookie с TTL для JSON
  const setCookieJSONTTL = (name: string, value: any, ttl: number, options?: any): void => {
    setCookieJSON(name, value, {
      ...options,
      expires: ttl
    })
  }

  // Инжектим в приложение
  return {
    provide: {
      setCookie,
      getCookie,
      removeCookie,
      hasCookie,
      getAllCookies,
      clearAllCookies,
      setCookieJSON,
      getCookieJSON,
      setCookieTTL,
      setCookieJSONTTL
    }
  }
})
