import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { HomepageTag } from '../core/types'

export class HomepageTagsService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить теги для главной страницы по городу
   */
  async getHomepageTagsByCity(params: {
    cityId: number
    departments: number[]
  }): Promise<HomepageTag[]> {
    const cacheKey = `homepage-tags:${params.cityId}:${params.departments.join(',')}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<HomepageTag[]>(`web/homepage-tags/by-city/${params.cityId}`, params.departments),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      15 * 60 * 1000 // 15 минут кэш
    )
  }

  /**
   * Получить все доступные теги
   */
  async getAllTags(): Promise<HomepageTag[]> {
    const cacheKey = 'homepage-tags:all'
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<HomepageTag[]>('web/homepage-tags/all'),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Получить теги по категории
   */
  async getTagsByCategory(categoryId: string): Promise<HomepageTag[]> {
    const cacheKey = `homepage-tags:category:${categoryId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<HomepageTag[]>(`web/homepage-tags/category/${categoryId}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      20 * 60 * 1000 // 20 минут кэш
    )
  }

  /**
   * Инвалидировать кэш тегов
   */
  invalidateTagsCache(): void {
    cacheUtils.invalidatePrefix('homepage-tags:')
  }
}
