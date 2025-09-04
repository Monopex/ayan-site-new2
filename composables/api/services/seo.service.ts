import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'

export interface SEOData {
  title: string
  titleKz?: string
  description: string
  descriptionKz?: string
  keywords: string[]
  keywordsKz?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  robots?: string
  h1?: string
  h1Kz?: string
}

export class SEOService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить SEO данные для категории
   */
  async getCategorySEO(params: {
    cityId: number
    keyName: string
  }): Promise<SEOData> {
    const cacheKey = `seo:category:${params.cityId}:${params.keyName}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<SEOData>(`site/seo/category/${params.cityId}/${params.keyName}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить SEO данные для продукта
   */
  async getProductSEO(params: {
    cityId: number
    keyName: string
    departmentId: number
  }): Promise<SEOData> {
    const cacheKey = `seo:product:${params.cityId}:${params.keyName}:${params.departmentId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<SEOData>(`site/seo/product/${params.cityId}/${params.keyName}/${params.departmentId}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить SEO данные для главной страницы
   */
  async getHomepageSEO(cityId: number): Promise<SEOData> {
    const cacheKey = `seo:homepage:${cityId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<SEOData>(`site/seo/homepage/${cityId}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить SEO данные для страницы поиска
   */
  async getSearchSEO(params: {
    cityId: number
    query: string
  }): Promise<SEOData> {
    const cacheKey = `seo:search:${params.cityId}:${params.query}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<SEOData>(`site/seo/search/${params.cityId}/${encodeURIComponent(params.query)}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Получить мета-теги для страницы
   */
  async getMetaTags(params: {
    page: string
    cityId: number
    additionalParams?: Record<string, string>
  }): Promise<{
    title: string
    description: string
    keywords: string[]
    ogTitle: string
    ogDescription: string
    ogImage: string
    canonicalUrl: string
  }> {
    const cacheKey = `seo:meta:${params.page}:${params.cityId}:${JSON.stringify(params.additionalParams || {})}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<{
          title: string
          description: string
          keywords: string[]
          ogTitle: string
          ogDescription: string
          ogImage: string
          canonicalUrl: string
        }>('site/seo/meta-tags', params),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Инвалидировать кэш SEO
   */
  invalidateSEOCache(): void {
    cacheUtils.invalidatePrefix('seo:')
  }

  /**
   * Инвалидировать кэш конкретной страницы
   */
  invalidatePageSEOCache(page: string, cityId: number): void {
    this.cache.delete(`seo:${page}:${cityId}`)
  }
}
