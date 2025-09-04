import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'

export interface Action {
  id: string
  title: string
  titleKz?: string
  description: string
  descriptionKz?: string
  imageUrl: string
  startDate: string
  endDate: string
  isActive: boolean
  discount?: number
  conditions?: string
}

export class ActionsService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить все акции по городу
   */
  async getAllActions(cityId: number): Promise<Action[]> {
    const cacheKey = `actions:${cityId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<Action[]>(`site/promotions/${cityId}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Инвалидировать кэш акций
   */
  invalidateActionsCache(): void {
    cacheUtils.invalidatePrefix('actions:')
  }
}
