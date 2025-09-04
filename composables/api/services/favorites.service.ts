import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { Product } from '../core/types'

export interface FavoriteDepartment {
  id: number
  name: string
  address: string
  isActive: boolean
}

export interface FavoriteProduct {
  productId: string
  providerId: string
  departmentId: string
  addedAt: string
}

export class FavoritesService {
  private client = getApiClient()

  /**
   * Получить избранные департаменты
   */
  async getFavoriteDepartments(clientId: string): Promise<FavoriteDepartment[]> {
    return RetryHandler.withRetry(
      () => this.client.get<FavoriteDepartment[]>(`site/favorite/departments/get/${clientId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Добавить департамент в избранное
   */
  async addFavoriteDepartment(departmentId: number): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.get<{ success: boolean; message?: string }>(`site/favorite/department/add/${departmentId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Удалить департамент из избранного
   */
  async removeFavoriteDepartment(departmentId: number): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.delete<{ success: boolean; message?: string }>(`site/favorite/departments/delete/${departmentId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить избранные продукты с фильтрацией
   */
  async getFavoriteProducts(params: {
    page?: number
    size?: number
    departmentIds?: number[]
    categoryIds?: string[]
  }): Promise<{
    content: FavoriteProduct[]
    totalPages: number
    totalElements: number
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        content: FavoriteProduct[]
        totalPages: number
        totalElements: number
      }>('site/favorite/get/filter/site', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить избранные продукты
   */
  async getFavoriteProductsList(params: {
    page?: number
    size?: number
  }): Promise<{
    content: FavoriteProduct[]
    totalPages: number
    totalElements: number
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        content: FavoriteProduct[]
        totalPages: number
        totalElements: number
      }>('site/favorite/product/get/site', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Добавить продукт в избранное
   */
  async addFavoriteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.get<{ success: boolean; message?: string }>(`site/favorite/product/add/${productId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Удалить продукт из избранного
   */
  async removeFavoriteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.delete<{ success: boolean; message?: string }>(`site/favorite/product/delete/${productId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Проверить, добавлен ли продукт в избранное
   */
  async isProductFavorite(productId: string): Promise<boolean> {
    try {
      const response = await this.client.get<{ isFavorite: boolean }>(`site/favorite/product/check/${productId}`)
      return response.isFavorite
    } catch (error) {
      return false
    }
  }

  /**
   * Получить количество избранных продуктов
   */
  async getFavoriteProductsCount(): Promise<number> {
    try {
      const response = await this.client.get<{ count: number }>('site/favorite/product/count')
      return response.count
    } catch (error) {
      return 0
    }
  }
}
