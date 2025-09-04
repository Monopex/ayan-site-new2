import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { City, Department, Address } from '../core/types'

export class GeoService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить все города
   */
  async getAllCities(): Promise<City[]> {
    const cacheKey = 'geo:cities'
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<City[]>('site/city/cities'),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить информацию о департаменте
   */
  async getDepartmentInfo(departmentId: number): Promise<Department> {
    const cacheKey = `geo:department:${departmentId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<Department>(`site/department/${departmentId}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Найти департаменты по адресу
   */
  async findDepartmentsByAddress(address: {
    lat: number
    lng: number
    street?: string
    house?: string
  }): Promise<{
    departments: Department[]
    availableDepartments: number[]
    address: Address
  }> {
    const cacheKey = `geo:departments:${address.lat}:${address.lng}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<{
          departments: Department[]
          availableDepartments: number[]
          address: Address
        }>('site/geo/find/address', address),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      15 * 60 * 1000 // 15 минут кэш
    )
  }

  /**
   * Получить геолокацию по IP
   */
  async getLocationByIP(): Promise<{ city: string; coordinates: { lat: number; lng: number } }> {
    try {
      // Используем внешний сервис для определения геолокации
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      return {
        city: data.city || 'Алматы',
        coordinates: {
          lat: data.latitude || 43.2220,
          lng: data.longitude || 76.8512
        }
      }
    } catch (error) {
      console.warn('Не удалось определить геолокацию по IP, используем значения по умолчанию')
      return {
        city: 'Алматы',
        coordinates: {
          lat: 43.2220,
          lng: 76.8512
        }
      }
    }
  }

  /**
   * Сохранить выбранный город
   */
  saveSelectedCity(cityId: number, cityName: string): void {
    const cityIdCookie = useCookie('cityId', { 
      maxAge: 60 * 60 * 24 * 365, // 1 год
      secure: true,
      sameSite: 'strict'
    })
    const cityNameCookie = useCookie('cityName', { 
      maxAge: 60 * 60 * 24 * 365, // 1 год
      secure: true,
      sameSite: 'strict'
    })

    cityIdCookie.value = cityId.toString()
    cityNameCookie.value = cityName

    if (process.client) {
      const info = {
        activeCity: cityId,
        cityName: cityName,
        timestamp: Date.now()
      }
      localStorage.setItem('info', JSON.stringify(info))
    }
  }

  /**
   * Получить сохраненный город
   */
  getSavedCity(): { cityId: number; cityName: string } | null {
    const cityId = useCookie('cityId').value
    const cityName = useCookie('cityName').value

    if (cityId && cityName) {
      return {
        cityId: parseInt(cityId),
        cityName: cityName
      }
    }

    // Пытаемся получить из localStorage
    if (process.client) {
      try {
        const info = localStorage.getItem('info')
        if (info) {
          const parsedInfo = JSON.parse(info)
          if (parsedInfo.activeCity && parsedInfo.cityName) {
            return {
              cityId: parsedInfo.activeCity,
              cityName: parsedInfo.cityName
            }
          }
        }
      } catch (error) {
        console.warn('Ошибка при чтении сохраненного города из localStorage')
      }
    }

    return null
  }

  /**
   * Сохранить адрес доставки
   */
  saveDeliveryAddress(address: Address): void {
    const addressCookie = useCookie('deliveryAddress', { 
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      secure: true,
      sameSite: 'strict'
    })
    const addressTimeCookie = useCookie('addressTimeCreate', { 
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      secure: true,
      sameSite: 'strict'
    })

    addressCookie.value = JSON.stringify(address)
    addressTimeCookie.value = Math.floor(Date.now() / 1000).toString()

    if (process.client) {
      localStorage.setItem('deliveryAddress', JSON.stringify(address))
    }
  }

  /**
   * Получить сохраненный адрес доставки
   */
  getSavedAddress(): Address | null {
    const addressCookie = useCookie('deliveryAddress').value

    if (addressCookie) {
      try {
        return JSON.parse(addressCookie)
      } catch (error) {
        console.warn('Ошибка при парсинге сохраненного адреса')
      }
    }

    // Пытаемся получить из localStorage
    if (process.client) {
      try {
        const address = localStorage.getItem('deliveryAddress')
        if (address) {
          return JSON.parse(address)
        }
      } catch (error) {
        console.warn('Ошибка при чтении сохраненного адреса из localStorage')
      }
    }

    return null
  }

  /**
   * Проверить, нужно ли обновить адрес
   */
  shouldUpdateAddress(): boolean {
    const addressTime = useCookie('addressTimeCreate').value
    if (!addressTime) return false

    const timeDiff = Math.floor(Date.now() / 1000) - parseInt(addressTime)
    return timeDiff > 6 * 60 * 60 // 6 часов
  }

  /**
   * Очистить сохраненные данные геолокации
   */
  clearGeoData(): void {
    const cityIdCookie = useCookie('cityId')
    const cityNameCookie = useCookie('cityName')
    const addressCookie = useCookie('deliveryAddress')
    const addressTimeCookie = useCookie('addressTimeCreate')
    const departmentsCookie = useCookie('availableDepartments')

    cityIdCookie.value = null
    cityNameCookie.value = null
    addressCookie.value = null
    addressTimeCookie.value = null
    departmentsCookie.value = null

    if (process.client) {
      localStorage.removeItem('info')
      localStorage.removeItem('deliveryAddress')
    }

    // Очищаем кэш
    cacheUtils.invalidatePrefix('geo:')
  }

  /**
   * Инвалидировать кэш геолокации
   */
  invalidateGeoCache(): void {
    cacheUtils.invalidatePrefix('geo:')
  }
}
