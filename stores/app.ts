import { defineStore } from 'pinia'
import { useGeoStore } from './geo'
import { useCategoriesStore } from './categories'
import { useAuthStore } from './auth'

export const useAppStore = defineStore('app', () => {
  const geoStore = useGeoStore()
  const categoriesStore = useCategoriesStore()
  const authStore = useAuthStore()

  /**
   * Инициализация приложения (аналог nuxtServerInit)
   */
  const initializeApp = async () => {
    try {
      // Загружаем города
      await geoStore.getAllCities()
      
      // Загружаем категории по департаментам
      await categoriesStore.getCategoriesByDepartment()
      
      // Получаем геокоординаты на основе сохраненного или дефолтного города
      const cityId = useCookie('cityId').value || geoStore.info.activeCity
      const geoCoords = geoStore.getGeoCoords(cityId)
      
      if (geoCoords) {
        // Загружаем департаменты по адресу
        await geoStore.getDepartmentByAddress(geoCoords)
        
        // Загружаем категории для hover-панели
        await categoriesStore.getHoverPanelCategories(geoStore.info.depIds)
      }
    } catch (error) {
      console.error('Ошибка при инициализации приложения:', error)
    }
  }

  /**
   * Проверка токена при инициализации
   */
  const checkAuth = async () => {
    const token = useCookie('TOKEN').value
    if (token) {
      try {
        await authStore.checkToken()
      } catch (error) {
        console.warn('Ошибка проверки токена:', error)
      }
    }
  }

  return {
    initializeApp,
    checkAuth
  }
})
