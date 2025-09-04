import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { Review } from '../core/types'

export interface CreateReviewRequest {
  productId: string
  providerId: string
  departmentId: string
  rating: number
  comment: string
  images?: File[]
}

export interface ReviewImage {
  id: string
  url: string
  thumbnailUrl?: string
}

export interface UnreviewedProduct {
  productId: string
  productName: string
  orderId: string
  orderDate: string
  canReview: boolean
}

export class ReviewsService {
  private client = getApiClient()

  /**
   * Создать отзыв
   */
  async createReview(reviewData: CreateReviewRequest): Promise<{ success: boolean; reviewId?: string; message?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для создания отзыва')
    }

    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; reviewId?: string; message?: string }>(
        'site/provider/review/create',
        reviewData,
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Загрузить изображения для отзыва
   */
  async uploadReviewImages(reviewId: string, images: File[]): Promise<ReviewImage[]> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для загрузки изображений')
    }

    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append(`files`, image)
    })

    return RetryHandler.withRetry(
      () => this.client.upload<ReviewImage[]>(`site/provider/review/image/upload/${reviewId}`, formData, {
        headers: { TOKEN: token }
      }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Загрузить медиа для отзыва заказа
   */
  async uploadOrderReviewMedia(orderId: string, files: File[]): Promise<{ success: boolean; message?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для загрузки медиа')
    }

    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })

    return RetryHandler.withRetry(
      () => this.client.upload<{ success: boolean; message?: string }>(
        `web/client/provider/order/review/image/add/all/${orderId}`,
        formData,
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить отзывы продукта
   */
  async getProductReviews(params: {
    providerProductId: string
    page?: number
    size?: number
  }): Promise<{
    content: Review[]
    totalPages: number
    totalElements: number
  }> {
    const token = useCookie('TOKEN').value

    return RetryHandler.withRetry(
      () => this.client.post<{
        content: Review[]
        totalPages: number
        totalElements: number
      }>(`site/provider/review/getAll/${params.providerProductId}`, {
        page: params.page || 0,
        size: params.size || 10
      }, token ? { headers: { TOKEN: token } } : {}),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Лайкнуть отзыв
   */
  async likeReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для лайка')
    }

    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(
        `site/provider/review/like/increase/${reviewId}`,
        {},
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Убрать лайк с отзыва
   */
  async unlikeReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для убирания лайка')
    }

    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(
        `site/provider/review/like/decrease/${reviewId}`,
        {},
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Дизлайкнуть отзыв
   */
  async dislikeReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для дизлайка')
    }

    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(
        `site/provider/review/dislike/increase/${reviewId}`,
        {},
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Убрать дизлайк с отзыва
   */
  async undislikeReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для убирания дизлайка')
    }

    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(
        `site/provider/review/dislike/decrease/${reviewId}`,
        {},
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Проверить, может ли клиент оставить отзыв
   */
  async checkReviewPermission(params: {
    clientId: string
    productId: string
  }): Promise<{ canReview: boolean; reason?: string }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для проверки прав на отзыв')
    }

    return RetryHandler.withRetry(
      () => this.client.get<{ canReview: boolean; reason?: string }>(
        `site/provider/review/check/${params.clientId}/${params.productId}`,
        { headers: { TOKEN: token } }
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить неоцененные товары
   */
  async getUnreviewedProducts(params: {
    page?: number
    size?: number
  }): Promise<{
    content: UnreviewedProduct[]
    totalPages: number
    totalElements: number
  }> {
    const token = useCookie('TOKEN').value
    if (!token) {
      throw new Error('Необходима авторизация для получения неоцененных товаров')
    }

    return RetryHandler.withRetry(
      () => this.client.post<{
        content: UnreviewedProduct[]
        totalPages: number
        totalElements: number
      }>('client/products/review/unreviewed', params, {
        headers: { TOKEN: token }
      }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }
}
