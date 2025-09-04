import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { ProductCategory } from '../core/types'

export class CategoriesService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить все основные категории
   */
  async getAllMainCategories(departmentIds: number[]): Promise<ProductCategory[]> {
    const params = this.createParams(departmentIds)
    const cacheKey = `categories:main:${departmentIds.join(',')}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<ProductCategory[]>(`site/providerCategory/getAllMainSite${params}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Получить категории витрины
   */
  async getShowcaseCategories(params: {
    departmentIds: number[]
  }): Promise<ProductCategory[]> {
    const cacheKey = `categories:showcase:${params.departmentIds.join(',')}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<ProductCategory[]>('site/showcase/get/category/all', params),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      15 * 60 * 1000 // 15 минут кэш
    )
  }

  /**
   * Получить категорию по ID
   */
  async getCategoryById(params: {
    categoryId: string
    departments: number[]
  }): Promise<ProductCategory> {
    const paramsString = this.createParams(params.departments)
    const cacheKey = `category:${params.categoryId}:${params.departments.join(',')}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<ProductCategory>(`site/providerCategory/get/${params.categoryId}${paramsString}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Получить названия категорий для роботов
   */
  async getDepartmentCategories(): Promise<{ categoryId: string; categoryName: string }[]> {
    const cacheKey = 'categories:department:names'
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<{ categoryId: string; categoryName: string }[]>('site/providerCategory/getCategoryNames?departmentIds=5'),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Создать параметры запроса из массива департаментов
   */
  private createParams(departments: number[]): string {
    if (!departments || departments.length === 0) {
      return ''
    }

    const params = departments.reduce((accum, id) => {
      return accum + `id=${id}&`
    }, '')
    
    return `?${params.slice(0, -1)}`
  }

  /**
   * Инвалидировать кэш категорий
   */
  invalidateCategoriesCache(): void {
    cacheUtils.invalidatePrefix('categories:')
    cacheUtils.invalidatePrefix('category:')
  }

  /**
   * Инвалидировать кэш конкретной категории
   */
  invalidateCategoryCache(categoryId: string): void {
    this.cache.delete(`category:${categoryId}`)
  }
}
