import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import { getApiCache, cacheUtils } from '../core/cache'
import type { Banner } from '../core/types'

export interface StaticPage {
  id: string
  title: string
  titleKz?: string
  content: string
  contentKz?: string
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  metaTitle?: string
  metaDescription?: string
}

export interface CategoryBanner {
  id: string
  categoryId: string
  imageUrl: string
  title?: string
  titleKz?: string
  linkUrl?: string
  order: number
  isActive: boolean
}

export class StaticService {
  private client = getApiClient()
  private cache = getApiCache()

  /**
   * Получить статическую страницу
   */
  async getStaticPage(localization: string, slug: string): Promise<StaticPage> {
    const cacheKey = `static:page:${localization}:${slug}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<StaticPage>(`static/page/get/${localization}/${slug}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      60 * 60 * 1000 // 1 час кэш
    )
  }

  /**
   * Получить баннеры по городу и устройству
   */
  async getBanners(params: {
    cityId: number
    device: 'desktop' | 'mobile' | 'tablet'
  }): Promise<Banner[]> {
    const cacheKey = `banners:${params.cityId}:${params.device}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<Banner[]>(`admin/banner/get/all/byCityId/new/${params.cityId}/${params.device}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
    )
  }

  /**
   * Получить баннер категории
   */
  async getCategoryBanner(params: {
    categoryId: string
    departments: number[]
  }): Promise<CategoryBanner | null> {
    const paramsString = this.createParams(params.departments)
    const cacheKey = `banner:category:${params.categoryId}:${params.departments.join(',')}`
    
    return cacheUtils.withCache(
      cacheKey,
      () => RetryHandler.withRetry(
        () => this.client.get<CategoryBanner | null>(`admin/banner/category/image/${params.categoryId}${paramsString}`),
        { maxRetries: 2, baseDelay: 1000 }
      ),
      30 * 60 * 1000 // 30 минут кэш
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
   * Инвалидировать кэш статических данных
   */
  invalidateStaticCache(): void {
    cacheUtils.invalidatePrefix('static:')
    cacheUtils.invalidatePrefix('banners:')
    cacheUtils.invalidatePrefix('banner:')
  }
}
