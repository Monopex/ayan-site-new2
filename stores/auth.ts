import { defineStore } from 'pinia'
import { AuthService } from '~/composables/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const clientAddress = ref({})
  const clientSingle = ref({})
  const clientOrders = ref({})
  const isAuthenticated = ref(false)
  const user = ref<{
    clientId?: string
    name?: string
    surname?: string
    email?: string
    phone?: string
  } | null>(null)

  // Services
  const authService = new AuthService()

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value?.clientId)
  const currentUser = computed(() => user.value)

  // Actions
  const checkToken = async () => {
    const token = useCookie('TOKEN').value
    if (!token) {
      isAuthenticated.value = false
      user.value = null
      return false
    }

    try {
      const tokenData = process.client 
        ? JSON.parse(localStorage.getItem('refToken') || '{}')
        : null

      if (tokenData) {
        const expTime = new Date(tokenData.tokenExpirationDate).getTime()
        const expTimeOfRefresh = new Date(tokenData.refreshTokenExpirationDate).getTime()
        const curTime = new Date().getTime()

        // Если рефреш токен тоже истек, удаляем старый токен
        if (expTimeOfRefresh - curTime <= 50000) {
          await signOut()
          return false
        }

        // Если токен истекает через 50 секунд, обновляем его
        if (expTime - curTime <= 50000) {
          await refreshToken({ refreshToken: tokenData.refreshToken })
        }
      }

      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('Ошибка проверки токена:', error)
      await signOut()
      return false
    }
  }

  const signIn = async (credentials: { phone: string; password: string }) => {
    try {
      const response = await authService.signIn(credentials)
      
      if (response.type === 'error') {
        throw new Error(response.message || 'Ошибка авторизации')
      }

      // Сохраняем данные авторизации
      authService.saveAuthData(response)
      
      isAuthenticated.value = true
      user.value = {
        clientId: response.clientId,
        name: response.name,
        surname: response.surname,
        email: response.email,
        phone: response.phone
      }

      return response
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      throw error
    }
  }

  const signUp = async (userData: {
    phone: string
    password: string
    name?: string
    surname?: string
  }) => {
    try {
      const response = await authService.signUp(userData)
      
      if (response.type === 'error') {
        throw new Error(response.message || 'Ошибка регистрации')
      }

      // Сохраняем данные авторизации
      authService.saveAuthData(response)
      
      isAuthenticated.value = true
      user.value = {
        clientId: response.clientId,
        name: response.name,
        surname: response.surname,
        email: response.email,
        phone: response.phone
      }

      return response
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      throw error
    }
  }

  const refreshToken = async (refreshData: { refreshToken: string }) => {
    try {
      const response = await authService.refreshToken(refreshData)
      
      // Обновляем токен в cookies
      const tokenCookie = useCookie('TOKEN')
      tokenCookie.value = response.token

      if (process.client) {
        localStorage.setItem('refToken', JSON.stringify(response))
      }

      return response
    } catch (error) {
      console.error('Ошибка обновления токена:', error)
      await signOut()
      throw error
    }
  }

  const resetPassword = async (phone: string) => {
    try {
      const response = await authService.resetPassword({ phone })
      return response
    } catch (error) {
      console.error('Ошибка сброса пароля:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      
      isAuthenticated.value = false
      user.value = null
      clientAddress.value = {}
      clientSingle.value = {}
      clientOrders.value = {}
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  const setClientAddress = (address: any) => {
    clientAddress.value = address
  }

  const setClientSingle = (client: any) => {
    clientSingle.value = client
  }

  const setClientOrders = (orders: any) => {
    clientOrders.value = orders
  }

  return {
    // State
    clientAddress: readonly(clientAddress),
    clientSingle: readonly(clientSingle),
    clientOrders: readonly(clientOrders),
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    
    // Getters
    isLoggedIn,
    currentUser,
    
    // Actions
    checkToken,
    signIn,
    signUp,
    refreshToken,
    resetPassword,
    signOut,
    setClientAddress,
    setClientSingle,
    setClientOrders
  }
})
