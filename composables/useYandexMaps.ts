/**
 * Composable для работы с Yandex Maps
 */
export const useYandexMaps = () => {
  const { 
    initYandexMaps, 
    createMap, 
    createPlacemark, 
    createClusterer,
    geocode,
    reverseGeocode,
    searchAddress,
    createRoute,
    utils
  } = useNuxtApp()

  // Состояние карты
  const map = ref<any>(null)
  const isMapReady = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Инициализация карты
  const initMap = async (containerId: string, options: any = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      map.value = await createMap(containerId, options)
      isMapReady.value = true
      
      return map.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка инициализации карты'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Добавление метки на карту
  const addPlacemark = async (coordinates: number[], properties: any = {}, options: any = {}) => {
    if (!map.value) {
      throw new Error('Карта не инициализирована')
    }

    try {
      const placemark = await createPlacemark(coordinates, properties, options)
      map.value.geoObjects.add(placemark)
      return placemark
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка добавления метки'
      throw err
    }
  }

  // Удаление всех меток с карты
  const clearPlacemarks = () => {
    if (map.value) {
      map.value.geoObjects.removeAll()
    }
  }

  // Установка центра карты
  const setCenter = (coordinates: number[], zoom?: number) => {
    if (map.value) {
      map.value.setCenter(coordinates, zoom)
    }
  }

  // Получение центра карты
  const getCenter = (): number[] | null => {
    if (map.value) {
      return map.value.getCenter()
    }
    return null
  }

  // Установка зума
  const setZoom = (zoom: number) => {
    if (map.value) {
      map.value.setZoom(zoom)
    }
  }

  // Получение зума
  const getZoom = (): number | null => {
    if (map.value) {
      return map.value.getZoom()
    }
    return null
  }

  // Поиск адреса
  const searchAddresses = async (query: string, options: any = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const addresses = await searchAddress(query, options)
      return addresses
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка поиска адреса'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Геокодирование адреса
  const geocodeAddress = async (address: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await geocode(address)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка геокодирования'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Обратное геокодирование
  const reverseGeocodeCoordinates = async (coordinates: number[]) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await reverseGeocode(coordinates)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка обратного геокодирования'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Создание маршрута
  const createMapRoute = async (from: number[], to: number[], options: any = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const route = await createRoute(from, to, options)
      return route
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка создания маршрута'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Очистка карты
  const clearMap = () => {
    if (map.value) {
      map.value.geoObjects.removeAll()
    }
  }

  // Уничтожение карты
  const destroyMap = () => {
    if (map.value) {
      map.value.destroy()
      map.value = null
      isMapReady.value = false
    }
  }

  // Получение границ карты
  const getBounds = (): number[][] | null => {
    if (map.value) {
      return map.value.getBounds()
    }
    return null
  }

  // Проверка, находится ли точка в видимой области
  const isPointInView = (coordinates: number[]): boolean => {
    if (map.value) {
      const bounds = map.value.getBounds()
      if (bounds) {
        const [minLat, minLon] = bounds[0]
        const [maxLat, maxLon] = bounds[1]
        const [lat, lon] = coordinates
        
        return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
      }
    }
    return false
  }

  // Подписка на события карты
  const onMapEvent = (event: string, callback: (...args: any[]) => void) => {
    if (map.value) {
      map.value.events.add(event, callback)
    }
  }

  // Отписка от событий карты
  const offMapEvent = (event: string, callback: (...args: any[]) => void) => {
    if (map.value) {
      map.value.events.remove(event, callback)
    }
  }

  // Очистка ошибок
  const clearError = () => {
    error.value = null
  }

  return {
    // Состояние
    map: readonly(map),
    isMapReady: readonly(isMapReady),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Методы
    initMap,
    addPlacemark,
    clearPlacemarks,
    setCenter,
    getCenter,
    setZoom,
    getZoom,
    searchAddresses,
    geocodeAddress,
    reverseGeocodeCoordinates,
    createMapRoute,
    clearMap,
    destroyMap,
    getBounds,
    isPointInView,
    onMapEvent,
    offMapEvent,
    clearError,

    // Утилиты
    utils
  }
}
