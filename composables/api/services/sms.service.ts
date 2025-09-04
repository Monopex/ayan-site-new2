import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'

export interface SMSRequest {
  phone: string
  message?: string
  type?: 'verification' | 'notification' | 'promo'
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  message?: string
  expiresAt?: string
}

export interface VerificationCodeRequest {
  phone: string
  code: string
}

export interface VerificationTokenRequest {
  phone: string
  token: string
}

export class SMSService {
  private client = getApiClient()

  /**
   * Создать код подтверждения
   */
  async createVerificationCode(phone: string): Promise<SMSResponse> {
    return RetryHandler.withRetry(
      () => this.client.post<SMSResponse>('site/client/code', { phone }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Проверить код подтверждения
   */
  async verifyCode(params: VerificationCodeRequest): Promise<{
    success: boolean
    message?: string
    token?: string
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        success: boolean
        message?: string
        token?: string
      }>('site/client/verify', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Проверить токен
   */
  async verifyToken(params: VerificationTokenRequest): Promise<{
    success: boolean
    message?: string
    clientId?: string
  }> {
    return RetryHandler.withRetry(
      () => this.client.post<{
        success: boolean
        message?: string
        clientId?: string
      }>('site/client/verify/token', params),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

}
