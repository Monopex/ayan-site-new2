/**
 * Утилиты для работы с геолокацией
 */
export const useGeo = () => {
  /**
   * Получение координат по ID города
   */
  const getGeo = (cityId: number): [string, string] | null => {
    // координаты дефолтных геоточек для каждого города
    const coords: Record<number, [string, string]> = {
      1: ['49.807853', '73.088881'], // Алматы
      2: ['50.058622', '72.952562'], // Нур-Султан
      3: ['51.166775', '71.41947']  // Шымкент
    }
    
    return coords[cityId] || null
  }

  /**
   * Получение названия города по ID
   */
  const getCityName = (cityId: number): string => {
    const cities: Record<number, string> = {
      1: 'Алматы',
      2: 'Нур-Султан',
      3: 'Шымкент'
    }
    
    return cities[cityId] || 'Неизвестный город'
  }

  /**
   * Вычисление расстояния между двумя точками (в км)
   */
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371 // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Проверка, находится ли точка в радиусе
   */
  const isInRadius = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusKm: number
  ): boolean => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2)
    return distance <= radiusKm
  }

  /**
   * Форматирование координат для отображения
   */
  const formatCoordinates = (lat: number, lon: number, precision: number = 6): string => {
    return `${lat.toFixed(precision)}, ${lon.toFixed(precision)}`
  }

  /**
   * Получение текущей геолокации пользователя
   */
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 минут
        }
      )
    })
  }

  /**
   * Слежение за геолокацией
   */
  const watchPosition = (
    onSuccess: (position: GeolocationPosition) => void,
    onError?: (error: GeolocationPositionError) => void
  ): number | null => {
    if (!navigator.geolocation) {
      onError?.(new Error('Геолокация не поддерживается') as any)
      return null
    }

    return navigator.geolocation.watchPosition(
      onSuccess,
      onError || (() => {}),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  /**
   * Остановка слежения за геолокацией
   */
  const clearWatch = (watchId: number): void => {
    navigator.geolocation.clearWatch(watchId)
  }

  return {
    getGeo,
    getCityName,
    calculateDistance,
    isInRadius,
    formatCoordinates,
    getCurrentPosition,
    watchPosition,
    clearWatch
  }
}
