import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { Story } from '../core/types'

export interface StoryProgress {
  storyId: string
  isViewed: boolean
  viewedAt?: string
  progress: number // 0-100
}

export class StoriesService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить истории по департаментам
   */
  async getStories(departmentIds: number[]): Promise<Story[]> {
    const cacheKey = `stories:${departmentIds.join(',')}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<Story[]>('api/provider/stories/get/site/byDepartment', {
          departmentIds
        }),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      15 * 60 * 1000 // 15 минут кэш
    )
  }


  /**
   * Инвалидировать кэш историй
   */
  invalidateStoriesCache(): void {
    cacheUtils.invalidatePrefix('stories:')
    cacheUtils.invalidatePrefix('story:')
  }

  /**
   * Инвалидировать кэш конкретной истории
   */
  invalidateStoryCache(storyId: string): void {
    this.cache.delete(`story:${storyId}`)
  }
}
