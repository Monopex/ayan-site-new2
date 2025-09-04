import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'

export interface RedirectInfo {
  id: string
  originalUrl: string
  redirectUrl: string
  statusCode: number
  isActive: boolean
  createdAt: string
  expiresAt?: string
}

export class RedirectService {
  private client = getApiClient()

  /**
   * Получить информацию о редиректе
   */
  async getRedirectInfo(redirectId: string): Promise<RedirectInfo> {
    return RetryHandler.withRetry(
      () => this.client.get<RedirectInfo>(`site/redirect/single/${redirectId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Создать редирект
   */
  async createRedirect(redirectData: {
    originalUrl: string
    redirectUrl: string
    statusCode?: number
    expiresAt?: string
  }): Promise<{ success: boolean; redirectId?: string; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; redirectId?: string; message?: string }>(
        'site/redirect/create',
        redirectData
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Обновить редирект
   */
  async updateRedirect(redirectId: string, redirectData: {
    redirectUrl?: string
    statusCode?: number
    isActive?: boolean
    expiresAt?: string
  }): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(
        `site/redirect/update/${redirectId}`,
        redirectData
      ),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Удалить редирект
   */
  async deleteRedirect(redirectId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.delete<{ success: boolean; message?: string }>(`site/redirect/delete/${redirectId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Получить статистику редиректов
   */
  async getRedirectStats(redirectId: string): Promise<{
    totalClicks: number
    uniqueClicks: number
    lastClickAt?: string
    clicksByDate: Array<{
      date: string
      clicks: number
    }>
  }> {
    return RetryHandler.withRetry(
      () => this.client.get<{
        totalClicks: number
        uniqueClicks: number
        lastClickAt?: string
        clicksByDate: Array<{
          date: string
          clicks: number
        }>
      }>(`site/redirect/stats/${redirectId}`),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }
}
