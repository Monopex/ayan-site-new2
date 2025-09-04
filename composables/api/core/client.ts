import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import type { ApiResponse, ApiError } from './types'

export class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || useRuntimeConfig().public.apiUrl || 'http://213.139.208.142:8083/api/'
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Добавляем токен авторизации
        const token = useCookie('TOKEN').value
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Добавляем device headers
        const deviceType = useCookie('device-type').value
        const deviceUuid = useCookie('device-uuid').value
        
        if (deviceType) {
          config.headers['device-type'] = deviceType
        }
        if (deviceUuid) {
          config.headers['device-uuid'] = deviceUuid
        }

        // Логирование запросов в dev режиме
        if (process.dev) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Логирование ответов в dev режиме
        if (process.dev) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
        }
        return response
      },
      (error: AxiosError) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: AxiosError) {
    const apiError: ApiError = {
      message: 'Произошла ошибка при выполнении запроса',
      status: error.response?.status,
      code: error.code,
      details: error.response?.data
    }

    // Обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const status = error.response.status
      
      switch (status) {
        case 401:
          apiError.message = 'Необходима авторизация'
          // Очищаем токены и перенаправляем на авторизацию
          this.clearAuthData()
          if (process.client) {
            navigateTo('/auth')
          }
          break
        case 403:
          apiError.message = 'Недостаточно прав для выполнения операции'
          break
        case 404:
          apiError.message = 'Ресурс не найден'
          break
        case 422:
          apiError.message = 'Ошибка валидации данных'
          break
        case 500:
          apiError.message = 'Внутренняя ошибка сервера'
          break
        default:
          apiError.message = `Ошибка сервера: ${status}`
      }

      // Извлекаем сообщение об ошибке из ответа сервера
      if (error.response.data && typeof error.response.data === 'object') {
        const serverError = error.response.data as any
        if (serverError.message) {
          apiError.message = serverError.message
        }
        if (serverError.error) {
          apiError.message = serverError.error
        }
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен
      apiError.message = 'Сервер не отвечает. Проверьте подключение к интернету'
    } else {
      // Ошибка при настройке запроса
      apiError.message = error.message || 'Неизвестная ошибка'
    }

    // Показываем уведомление об ошибке
    if (process.client) {
      // Здесь можно интегрировать с системой уведомлений
      console.error('API Error:', apiError)
    }

    return apiError
  }

  private clearAuthData() {
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

  // HTTP методы
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  // Метод для загрузки файлов
  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    })
    return response.data
  }

  // Метод для получения базового URL
  getBaseURL(): string {
    return this.baseURL
  }

  // Метод для обновления базового URL
  setBaseURL(url: string): void {
    this.baseURL = url
    this.client.defaults.baseURL = url
  }
}

// Создаем единственный экземпляр клиента
let apiClientInstance: ApiClient | null = null

export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient()
  }
  return apiClientInstance
}

// Экспортируем функцию для создания клиента с кастомным URL
export const createApiClient = (baseURL: string): ApiClient => {
  return new ApiClient(baseURL)
}
