import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { Product, ProductCategory } from '../core/types'

export interface ElasticSearchParams {
  name: string
  departmentId: number | number[]
  productSize?: number
  categorySize?: number
  language?: string
}

export interface ElasticSearchResponse {
  productData: Product[]
  categoryData: ProductCategory[]
}

export class ElasticSearchService {
  private client = getApiClient()

  /**
   * Поиск по всем индексам Elasticsearch
   * Соответствует старому API: elastic/product/search
   */
  async searchAllInElastic(params: ElasticSearchParams): Promise<ElasticSearchResponse> {
    return RetryHandler.withRetry(
      () => this.client.post<ElasticSearchResponse>('elastic/product/search', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Поиск продуктов и категорий с автодополнением
   * Используется в компоненте Search.vue
   */
  async searchWithAutocomplete(params: {
    name: string
    departmentId: number | number[]
    productSize?: number
    categorySize?: number
    language?: string
  }): Promise<{
    products: Product[]
    categories: ProductCategory[]
  }> {
    const response = await this.searchAllInElastic({
      name: params.name,
      departmentId: params.departmentId,
      productSize: params.productSize || 5,
      categorySize: params.categorySize || 5,
      language: params.language || 'ru'
    })

    return {
      products: response.productData || [],
      categories: response.categoryData || []
    }
  }

  /**
   * Поиск только продуктов
   */
  async searchProducts(params: {
    name: string
    departmentId: number | number[]
    productSize?: number
    language?: string
  }): Promise<Product[]> {
    const response = await this.searchAllInElastic({
      name: params.name,
      departmentId: params.departmentId,
      productSize: params.productSize || 10,
      categorySize: 0,
      language: params.language || 'ru'
    })

    return response.productData || []
  }

  /**
   * Поиск только категорий
   */
  async searchCategories(params: {
    name: string
    departmentId: number | number[]
    categorySize?: number
    language?: string
  }): Promise<ProductCategory[]> {
    const response = await this.searchAllInElastic({
      name: params.name,
      departmentId: params.departmentId,
      productSize: 0,
      categorySize: params.categorySize || 10,
      language: params.language || 'ru'
    })

    return response.categoryData || []
  }
}
