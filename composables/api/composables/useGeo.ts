import { ref, computed } from 'vue'
import { GeoService } from '../services/geo.service'
import type { City, Department, Address } from '../core/types'

const geoService = new GeoService()

export const useGeo = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cities = ref<City[]>([])
  const selectedCity = ref<City | null>(null)
  const departments = ref<Department[]>([])
  const availableDepartments = ref<number[]>([])
  const currentAddress = ref<Address | null>(null)
  const savedAddress = ref<Address | null>(null)

  // Вычисляемые свойства
  const hasCities = computed(() => cities.value.length > 0)
  const hasDepartments = computed(() => departments.value.length > 0)
  const hasAddress = computed(() => !!currentAddress.value?.street)
  const hasSavedAddress = computed(() => !!savedAddress.value?.street)
  const shouldUpdateAddress = computed(() => geoService.shouldUpdateAddress())

  // Методы для работы с городами
  const fetchCities = async (): Promise<City[]> => {
    loading.value = true
    error.value = null

    try {
      const citiesList = await geoService.getAllCities()
      cities.value = citiesList
      return citiesList
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке городов'
      return []
    } finally {
      loading.value = false
    }
  }

  const selectCity = async (cityId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const city = cities.value.find(c => c.id === cityId)
      if (!city) {
        throw new Error('Город не найден')
      }

      selectedCity.value = city
      geoService.saveSelectedCity(cityId, city.name)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при выборе города'
      return false
    } finally {
      loading.value = false
    }
  }

  const getSavedCity = (): { cityId: number; cityName: string } | null => {
    return geoService.getSavedCity()
  }

  // Методы для работы с департаментами
  const fetchDepartmentInfo = async (departmentId: number): Promise<Department | null> => {
    loading.value = true
    error.value = null

    try {
      const department = await geoService.getDepartmentInfo(departmentId)
      return department
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке информации о департаменте'
      return null
    } finally {
      loading.value = false
    }
  }

  const findDepartmentsByAddress = async (address: {
    lat: number
    lng: number
    street?: string
    house?: string
  }): Promise<{
    departments: Department[]
    availableDepartments: number[]
    address: Address
  } | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await geoService.findDepartmentsByAddress(address)
      departments.value = result.departments
      availableDepartments.value = result.availableDepartments
      currentAddress.value = result.address

      // Сохраняем доступные департаменты в cookie
      const departmentsCookie = useCookie('availableDepartments', {
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        secure: true,
        sameSite: 'strict'
      })
      departmentsCookie.value = JSON.stringify(result.availableDepartments)

      return result
    } catch (err: any) {
      error.value = err.message || 'Ошибка при поиске департаментов по адресу'
      return null
    } finally {
      loading.value = false
    }
  }

  // Методы для работы с адресами
  const saveAddress = (address: Address): void => {
    geoService.saveDeliveryAddress(address)
    savedAddress.value = address
  }

  const getSavedAddress = (): Address | null => {
    const address = geoService.getSavedAddress()
    savedAddress.value = address
    return address
  }

  const setCurrentAddress = (address: Address): void => {
    currentAddress.value = address
  }

  const clearAddress = (): void => {
    currentAddress.value = null
    savedAddress.value = null
  }

  // Методы для работы с геолокацией
  const getLocationByIP = async (): Promise<{ city: string; coordinates: { lat: number; lng: number } }> => {
    loading.value = true
    error.value = null

    try {
      const location = await geoService.getLocationByIP()
      return location
    } catch (err: any) {
      error.value = err.message || 'Ошибка при определении геолокации'
      return {
        city: 'Алматы',
        coordinates: { lat: 43.2220, lng: 76.8512 }
      }
    } finally {
      loading.value = false
    }
  }

  // Утилиты
  const clearGeoData = (): void => {
    geoService.clearGeoData()
    cities.value = []
    selectedCity.value = null
    departments.value = []
    availableDepartments.value = []
    currentAddress.value = null
    savedAddress.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  const invalidateCache = (): void => {
    geoService.invalidateGeoCache()
  }

  // Инициализация при создании composable
  const init = async (): Promise<void> => {
    // Загружаем города
    await fetchCities()

    // Пытаемся получить сохраненный город
    const savedCity = getSavedCity()
    if (savedCity) {
      const city = cities.value.find(c => c.id === savedCity.cityId)
      if (city) {
        selectedCity.value = city
      }
    }

    // Пытаемся получить сохраненный адрес
    getSavedAddress()
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    cities: readonly(cities),
    selectedCity: readonly(selectedCity),
    departments: readonly(departments),
    availableDepartments: readonly(availableDepartments),
    currentAddress: readonly(currentAddress),
    savedAddress: readonly(savedAddress),
    
    // Вычисляемые свойства
    hasCities,
    hasDepartments,
    hasAddress,
    hasSavedAddress,
    shouldUpdateAddress,
    
    // Методы
    init,
    fetchCities,
    selectCity,
    getSavedCity,
    fetchDepartmentInfo,
    findDepartmentsByAddress,
    saveAddress,
    getSavedAddress,
    setCurrentAddress,
    clearAddress,
    getLocationByIP,
    clearGeoData,
    clearError,
    invalidateCache
  }
}
