import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'

export interface ErrorReport {
  id: string
  productId: string
  productName: string
  errorType: string
  description: string
  userAgent: string
  timestamp: string
  status: 'pending' | 'resolved' | 'rejected'
}

export interface ErrorType {
  id: string
  name: string
  description: string
  isActive: boolean
}

export class ErrorService {
  private client = getApiClient()

  /**
   * Получить все типы ошибок
   */
  async getAllErrorTypes(): Promise<ErrorType[]> {
    return RetryHandler.withRetry(
      () => this.client.get<ErrorType[]>('site/wrong/product/all/errors'),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Отправить сообщение об ошибке
   */
  async reportError(errorData: {
    productId: string
    errorType: string
    description: string
    userAgent?: string
  }): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.post<{ success: boolean; message?: string }>('site/worng/product/add', {
        ...errorData,
        userAgent: errorData.userAgent || (process.client ? navigator.userAgent : 'Server')
      }),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }

  /**
   * Получить статистику ошибок
   */
  async getErrorStats(): Promise<{
    totalErrors: number
    errorsByType: Record<string, number>
    recentErrors: ErrorReport[]
  }> {
    return RetryHandler.withRetry(
      () => this.client.get<{
        totalErrors: number
        errorsByType: Record<string, number>
        recentErrors: ErrorReport[]
      }>('site/wrong/product/stats'),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Отметить ошибку как решенную
   */
  async markErrorAsResolved(errorId: string): Promise<{ success: boolean; message?: string }> {
    return RetryHandler.withRetry(
      () => this.client.put<{ success: boolean; message?: string }>(`site/wrong/product/resolve/${errorId}`),
      { maxRetries: 1, baseDelay: 1000 }
    )
  }
}
