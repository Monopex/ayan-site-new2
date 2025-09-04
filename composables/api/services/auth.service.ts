import { getApiClient } from '../core/client'
import { RetryHandler } from '../core/retry'
import type { AuthRequest, AuthResponse, RefreshTokenRequest } from '../core/types'

export class AuthService {
  private client = getApiClient()

  /**
   * Авторизация по телефону и паролю
   */
  async signIn(credentials: AuthRequest): Promise<AuthResponse> {
    return RetryHandler.withRetry(
      () => this.client.post<AuthResponse>('client/auth/signin', credentials),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Регистрация нового пользователя
   */
  async signUp(userData: AuthRequest & { name?: string; surname?: string }): Promise<AuthResponse> {
    const headers = {
      'device-type': useCookie('device-type').value || '',
      'device-uuid': useCookie('device-uuid').value || ''
    }

    return RetryHandler.withRetry(
      () => this.client.post<AuthResponse>('client/auth/add', userData, { headers }),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Обновление токена
   */
  async refreshToken(refreshData: RefreshTokenRequest): Promise<AuthResponse> {
    return RetryHandler.withRetry(
      () => this.client.post<AuthResponse>('site/client/refresh/token', refreshData),
      { maxRetries: 1, baseDelay: 2000 }
    )
  }

  /**
   * Сброс пароля
   */
  async resetPassword(input: { phone: string }): Promise<any> {
    return RetryHandler.withRetry(
      () => this.client.put('client/auth/reset/password', input),
      { maxRetries: 2, baseDelay: 1000 }
    )
  }

  /**
   * Выход из системы
   */
  async signOut(): Promise<void> {
    // Очищаем локальные данные
    const tokenCookie = useCookie('TOKEN')
    const clientIdCookie = useCookie('clientId')
    const refreshTokenCookie = useCookie('refreshToken')
    
    tokenCookie.value = null
    clientIdCookie.value = null
    refreshTokenCookie.value = null

    if (process.client) {
      localStorage.removeItem('refToken')
      localStorage.removeItem('info')
    }
  }

  /**
   * Сохранить данные авторизации
   */
  saveAuthData(authData: AuthResponse): void {
    const tokenCookie = useCookie('TOKEN', { 
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      secure: true,
      sameSite: 'strict'
    })
    const clientIdCookie = useCookie('clientId', { 
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      secure: true,
      sameSite: 'strict'
    })
    const refreshTokenCookie = useCookie('refreshToken', { 
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      secure: true,
      sameSite: 'strict'
    })

    tokenCookie.value = authData.token
    clientIdCookie.value = authData.clientId
    refreshTokenCookie.value = authData.refreshToken

    if (process.client) {
      localStorage.setItem('refToken', JSON.stringify(authData))
    }
  }

  /**
   * Получить текущего пользователя
   */
  getCurrentUser(): { token: string | null; clientId: string | null } {
    return {
      token: useCookie('TOKEN').value,
      clientId: useCookie('clientId').value
    }
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    const token = useCookie('TOKEN').value
    return !!token
  }
}
