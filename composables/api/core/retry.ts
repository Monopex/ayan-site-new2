// Система повторных попыток для API запросов
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition?: (error: any) => boolean
}

export class RetryHandler {
  private static defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error: any) => {
      // Повторяем запрос для сетевых ошибок и 5xx ошибок
      return (
        !error.response || // Сетевая ошибка
        (error.response.status >= 500 && error.response.status < 600) // Серверные ошибки
      )
    }
  }

  /**
   * Выполнить функцию с повторными попытками
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config }
    let lastError: any

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // Если это последняя попытка, выбрасываем ошибку
        if (attempt === finalConfig.maxRetries) {
          throw error
        }

        // Проверяем, нужно ли повторять запрос
        if (finalConfig.retryCondition && !finalConfig.retryCondition(error)) {
          throw error
        }

        // Вычисляем задержку с экспоненциальным backoff
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelay
        )

        // Добавляем случайную jitter для избежания thundering herd
        const jitter = Math.random() * 0.1 * delay
        const finalDelay = delay + jitter

        console.warn(`API request failed (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}), retrying in ${Math.round(finalDelay)}ms`, error)

        // Ждем перед следующей попыткой
        await this.delay(finalDelay)
      }
    }

    throw lastError
  }

  /**
   * Создать функцию с повторными попытками
   */
  static createRetryFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    config: Partial<RetryConfig> = {}
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.withRetry(() => fn(...args), config)
    }
  }

  /**
   * Задержка выполнения
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Проверить, является ли ошибка временной
   */
  static isRetryableError(error: any): boolean {
    if (!error) return false

    // Сетевые ошибки
    if (!error.response) {
      return true
    }

    const status = error.response.status

    // 5xx ошибки сервера
    if (status >= 500 && status < 600) {
      return true
    }

    // 429 Too Many Requests
    if (status === 429) {
      return true
    }

    // 408 Request Timeout
    if (status === 408) {
      return true
    }

    return false
  }

  /**
   * Получить рекомендуемую задержку на основе HTTP статуса
   */
  static getRetryDelay(status: number, attempt: number, baseDelay: number = 1000): number {
    let delay = baseDelay

    // Специальная обработка для 429 (Too Many Requests)
    if (status === 429) {
      // Проверяем заголовок Retry-After
      const retryAfter = error.response?.headers?.['retry-after']
      if (retryAfter) {
        return parseInt(retryAfter) * 1000
      }
      // Увеличиваем задержку для rate limiting
      delay = baseDelay * 3
    }

    // Экспоненциальный backoff
    return Math.min(delay * Math.pow(2, attempt), 30000) // Максимум 30 секунд
  }
}

// Утилиты для работы с retry
export const retryUtils = {
  /**
   * Создать конфигурацию для критически важных запросов
   */
  critical: (): Partial<RetryConfig> => ({
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000
  }),

  /**
   * Создать конфигурацию для быстрых запросов
   */
  fast: (): Partial<RetryConfig> => ({
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 5000
  }),

  /**
   * Создать конфигурацию для медленных запросов
   */
  slow: (): Partial<RetryConfig> => ({
    maxRetries: 1,
    baseDelay: 5000,
    maxDelay: 10000
  }),

  /**
   * Создать конфигурацию без повторных попыток
   */
  none: (): Partial<RetryConfig> => ({
    maxRetries: 0
  })
}
