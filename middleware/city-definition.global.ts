/**
 * Global middleware для определения города пользователя
 * Работает на каждом роуте приложения
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const { $cookies } = useNuxtApp()
  const geoStore = useGeoStore()
  
  let cityId = $cookies.get('cityId')
  let department = $cookies.get('departmentId')
  let availableDepartments = $cookies.get('availableDepartments')
  
  // Если зашли первый раз и не выбран город
  if (typeof cityId === 'undefined') {
    // По умолчанию первый город в позиции
    cityId = geoStore.allCitiesListByKeyName["karaganda"]?.id
  }

  // Если был найден город в префиксе в строке браузера
  if (typeof to.params.cityId !== 'undefined') {
    // Если был введен не существующий город или ненайденный в списке в бд
    if (!geoStore.allCitiesListByKeyName[to.params.cityId as string]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Город не найден'
      })
    }
  }

  // Если нет города в строке браузера, а город указан (когда ранее были в другом городе и перешли на главную)
  else if (geoStore.allCitiesList[0] !== undefined) {
    // Логика для обработки случая когда нет города в URL
  }

  if (typeof department === 'undefined') {
    // Ставим первый департамент города если его нет
    const city = geoStore.allCitiesListById[cityId]
    if (city?.departments?.[0]) {
      department = city.departments[0].id
    }
  }

  // Сохраняем в cookies
  $cookies.set('cityId', cityId)
  $cookies.set('departmentId', department)
  if (availableDepartments) {
    $cookies.set('availableDepartments', availableDepartments)
  }
})
