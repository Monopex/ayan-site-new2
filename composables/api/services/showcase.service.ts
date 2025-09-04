import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { Showcase } from '../core/types'

export interface ShowcaseType {
  id: string
  name: string
  nameKz?: string
  description?: string
  isActive: boolean
  order: number
}

export interface ShowcaseWindow {
  id: string
  name: string
  nameKz?: string
  type: string
  order: number
  isActive: boolean
  config: Record<string, any>
}

export class ShowcaseService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить все типы витрин
   * Соответствует старому API: web/showcaseWindow/getTypes
   */
  async getShowcaseTypes(): Promise<ShowcaseType[]> {
    const cacheKey = 'showcase:types'
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<ShowcaseType[]>('web/showcaseWindow/getTypes'),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить витрины по параметрам
   * Соответствует старому API: web/showcaseWindow/get
   */
  async getShowcases(params: {
    departmentIds: number[]
    types?: string[]
    page?: number
    size?: number
  }): Promise<Showcase[]> {
    const cacheKey = `showcase:list:${JSON.stringify(params)}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<Showcase[]>('web/showcaseWindow/get', params),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      15 * 60 * 1000 // 15 минут кэш
    )
  }

  /**
   * Инвалидировать кэш витрин
   */
  invalidateShowcaseCache(): void {
    cacheUtils.invalidatePrefix('showcase:')
  }

  /**
   * Инвалидировать кэш конкретной витрины
   */
  invalidateShowcaseCacheById(showcaseId: string): void {
    this.cache.delete(`showcase:${showcaseId}`)
  }
}