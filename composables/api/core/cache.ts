// Система кэширования для API запросов
export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export class ApiCache {
  private cache = new Map<string, CacheItem>()
  private defaultTTL = 5 * 60 * 1000 // 5 минут по умолчанию

  /**
   * Получить данные из кэша
   */
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Проверяем, не истек ли TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * Сохранить данные в кэш
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    
    this.cache.set(key, item)
  }

  /**
   * Удалить данные из кэша
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Очистить устаревшие записи
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Получить размер кэша
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Проверить, существует ли ключ в кэше
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    // Проверяем TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Получить все ключи кэша
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Установить TTL по умолчанию
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl
  }

  /**
   * Создать ключ кэша на основе параметров запроса
   */
  static createKey(method: string, url: string, params?: any): string {
    const paramsString = params ? JSON.stringify(params) : ''
    return `${method.toUpperCase()}:${url}:${paramsString}`
  }
}

// Создаем единственный экземпляр кэша
let cacheInstance: ApiCache | null = null

export const getApiCache = (): ApiCache => {
  if (!cacheInstance) {
    cacheInstance = new ApiCache()
    
    // Очищаем кэш каждые 10 минут
    if (process.client) {
      setInterval(() => {
        cacheInstance?.cleanup()
      }, 10 * 60 * 1000)
    }
  }
  
  return cacheInstance
}

// Утилиты для работы с кэшем
export const cacheUtils = {
  /**
   * Кэшировать результат функции
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cache = getApiCache()
    
    // Проверяем кэш
    const cached = cache.get<T>(key)
    if (cached !== null) {
      return cached
    }
    
    // Выполняем функцию и кэшируем результат
    const result = await fn()
    cache.set(key, result, ttl)
    
    return result
  },

  /**
   * Инвалидировать кэш по паттерну
   */
  invalidatePattern(pattern: string): void {
    const cache = getApiCache()
    const regex = new RegExp(pattern)
    
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  },

  /**
   * Инвалидировать кэш по префиксу
   */
  invalidatePrefix(prefix: string): void {
    const cache = getApiCache()
    
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key)
      }
    }
  }
}
