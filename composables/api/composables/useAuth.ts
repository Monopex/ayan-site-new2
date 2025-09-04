import { ref, computed } from 'vue'
import { AuthService } from '../services/auth.service'
import type { AuthRequest, AuthResponse } from '../core/types'

const authService = new AuthService()

export const useAuth = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const user = ref<{ token: string | null; clientId: string | null } | null>(null)

  // Инициализация при создании composable
  const init = () => {
    user.value = authService.getCurrentUser()
  }

  // Вычисляемые свойства
  const isAuthenticated = computed(() => {
    return authService.isAuthenticated()
  })

  const hasToken = computed(() => {
    return !!user.value?.token
  })

  const clientId = computed(() => {
    return user.value?.clientId
  })

  // Методы авторизации
  const signIn = async (credentials: AuthRequest): Promise<AuthResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.signIn(credentials)
      authService.saveAuthData(response)
      user.value = authService.getCurrentUser()
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при авторизации'
      return null
    } finally {
      loading.value = false
    }
  }

  const signUp = async (userData: AuthRequest & { name?: string; surname?: string }): Promise<AuthResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.signUp(userData)
      authService.saveAuthData(response)
      user.value = authService.getCurrentUser()
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при регистрации'
      return null
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const refreshToken = useCookie('refreshToken').value
      if (!refreshToken) {
        throw new Error('Refresh token не найден')
      }

      const response = await authService.refreshToken({ refreshToken })
      authService.saveAuthData(response)
      user.value = authService.getCurrentUser()
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при обновлении токена'
      await signOut()
      return false
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (phone: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await authService.resetPassword(phone)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при сбросе пароля'
      return false
    } finally {
      loading.value = false
    }
  }

  const signOut = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await authService.signOut()
      user.value = null
    } catch (err: any) {
      error.value = err.message || 'Ошибка при выходе'
    } finally {
      loading.value = false
    }
  }

  const validateToken = async (): Promise<boolean> => {
    try {
      const result = await authService.validateToken()
      if (!result.valid) {
        await signOut()
        return false
      }
      return true
    } catch (err: any) {
      await signOut()
      return false
    }
  }

  // Автоматическая проверка токена при инициализации
  if (process.client && isAuthenticated.value) {
    validateToken()
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    user: readonly(user),
    
    // Вычисляемые свойства
    isAuthenticated,
    hasToken,
    clientId,
    
    // Методы
    init,
    signIn,
    signUp,
    refreshToken,
    resetPassword,
    signOut,
    validateToken
  }
}
