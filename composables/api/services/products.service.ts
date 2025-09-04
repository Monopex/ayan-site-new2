import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { 
  Product, 
  ProductCategory, 
  SearchParams, 
  SearchResponse, 
  FilterParams,
  PaginatedResponse,
  Review
} from '../core/types'

export class ProductsService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить продукты по категории
   */
  async getProductsByCategory(params: {
    categoryId: string
    departmentIds: number[]
    page?: number
    size?: number
  }): Promise<SearchResponse> {
    const cacheKey = `products:category:${params.categoryId}:${params.departmentIds.join(',')}:${params.page || 0}:${params.size || 10}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.put<SearchResponse>('site/provider/product/get/catalog/list/site', params),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      5 * 60 * 1000 // 5 минут кэш
    )
  }

  /**
   * Получить продукт по ID
   */
  async getProductById(productId: string): Promise<Product> {
    const cacheKey = `product:${productId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<Product>(`admin/provider/product/get/${productId}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      10 * 60 * 1000 // 10 минут кэш
    )
  }

  /**
   * Поиск продуктов
   */
  async searchProducts(params: SearchParams): Promise<SearchResponse> {
    const cacheKey = `products:search:${JSON.stringify(params)}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<SearchResponse>('elastic/product/site/byName', params),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      2 * 60 * 1000 // 2 минуты кэш
    )
  }

  /**
   * Получить продукты с фильтрацией
   */
  async getFilteredProducts(params: FilterParams): Promise<SearchResponse> {
    const cacheKey = `products:filter:${JSON.stringify(params)}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.put<SearchResponse>('client/product/get/filter/site', params),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      3 * 60 * 1000 // 3 минуты кэш
    )
  }

  /**
   * Получить недавно просмотренные продукты
   */
  async getRecentProducts(departmentIds: number[]): Promise<Product[]> {
    const params = { departmentIds }
    
    return RetryHandler.withRetry(
      () => this.client.post<{ searchResult: { content: Product[] } }>('web/client/product/recent', params),
      { maxRetries: 1, baseDelay: 1000 }
    ).then(response => response.searchResult?.content || [])
  }

  /**
   * Получить часто покупаемые продукты
   */
  async getFrequentlyPurchasedProducts(departmentIds: number[]): Promise<Product[]> {
    const params = { departmentIds }
    
    return RetryHandler.withRetry(
      () => this.client.post<{ content: Product[] }>('web/client/product/frequentlyPurchased', params),
      { maxRetries: 1, baseDelay: 1000 }
    ).then(response => response.content || [])
  }

  /**
   * Получить продукты витрины
   */
  async getShowcaseProducts(departmentIds: number[]): Promise<Record<string, Product[]>> {
    const params = { departmentIds }
    
    return RetryHandler.withRetry(
      () => this.client.post<Record<string, Product[]>>('site/showcase/getShowcase/site', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить продукты по умолчанию для витрины
   */
  async getDefaultShowcaseProducts(): Promise<Record<string, Product[]>> {
    return RetryHandler.withRetry(
      () => this.client.get<Record<string, Product[]>>('site/showcase/default'),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить общие продукты
   */
  async getSharedProducts(params: {
    productId: string
    providerId: string
    departmentId: string
  }): Promise<Product> {
    return RetryHandler.withRetry(
      () => this.client.post<Product>('site/provider/product/get/shared', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить рейтинг продукта
   */
  async getProductRating(providerProductId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const cacheKey = `product:rating:${providerProductId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<{ averageRating: number; totalReviews: number }>(`site/provider/review/getAverageRating/${providerProductId}`),
        { maxRetries: 1, baseDelay: 1000 }
      ),
      15 * 60 * 1000 // 15 минут кэш
    )
  }

  /**
   * Получить отзывы продукта
   */
  async getProductReviews(params: {
    providerProductId: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<Review>> {
    const cacheKey = `product:reviews:${params.providerProductId}:${params.page || 0}:${params.size || 10}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.post<PaginatedResponse<Review>>(`site/provider/review/getAll/${params.providerProductId}`, {
          page: params.page || 0,
          size: params.size || 10
        }),
        { maxRetries: 1, baseDelay: 1000 }
      ),
      10 * 60 * 1000 // 10 минут кэш
    )
  }

  /**
   * Лайк отзыва
   */
  async likeReview(reviewId: string): Promise<void> {
    await RetryHandler.withRetry(
      () => this.client.put(`site/provider/review/like/increase/${reviewId}`, {}),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Дизлайк отзыва
   */
  async dislikeReview(reviewId: string): Promise<void> {
    await RetryHandler.withRetry(
      () => this.client.put(`site/provider/review/dislike/increase/${reviewId}`, {}),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Убрать лайк отзыва
   */
  async unlikeReview(reviewId: string): Promise<void> {
    await RetryHandler.withRetry(
      () => this.client.put(`site/provider/review/like/decrease/${reviewId}`, {}),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Убрать дизлайк отзыва
   */
  async undislikeReview(reviewId: string): Promise<void> {
    await RetryHandler.withRetry(
      () => this.client.put(`site/provider/review/dislike/decrease/${reviewId}`, {}),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Получить изображения отзывов
   */
  async getReviewImages(providerProductId: string): Promise<string[]> {
    const cacheKey = `product:review-images:${providerProductId}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<string[]>(`site/provider/review/get/images/${providerProductId}`),
        { maxRetries: 1, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Сообщить о сломанном изображении
   */
  async reportBrokenImage(productId: string): Promise<void> {
    await RetryHandler.withRetry(
      () => this.client.post(`brokenImageProduct/add/${productId}`, {}),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Инвалидировать кэш продуктов
   */
  invalidateProductsCache(): void {
    cacheUtils.invalidatePrefix('products:')
    cacheUtils.invalidatePrefix('product:')
  }

  /**
   * Инвалидировать кэш конкретного продукта
   */
  invalidateProductCache(productId: string): void {
    this.cache.delete(`product:${productId}`)
    cacheUtils.invalidatePattern(`product:rating:${productId}`)
    cacheUtils.invalidatePattern(`product:reviews:${productId}`)
    cacheUtils.invalidatePattern(`product:review-images:${productId}`)
  }
}
