import { defineStore } from 'pinia'
import { GeoService } from '~/composables/api'

export interface City {
  id: number
  name: string
  nameEn: string
  nameKz?: string
  isActive: boolean
}

export interface Department {
  id: number
  name: string
  address: {
    street: string
    house: string
  }
  minOrderSum: number
  minOrderSumDelivery: number
  totalDeliveryPrice: number
  isAyan: boolean
  departmentIsFavorite: boolean
  paymentType: any[]
  packagePriceStep: number
  departmentImage: string
  departmentGroup?: string
}

export interface Address {
  street: string
  house: string
  apartment?: string
  entrance?: string
  floor?: string
  comment?: string
  geo: {
    lat: number
    lng: number
  }
}

export const useGeoStore = defineStore('geo', () => {
  // State
  const allCitiesList = ref<City[]>([])
  const allCitiesListById = ref<Record<number, City>>({})
  const allCitiesListByKeyName = ref<Record<string, City>>({})
  const cityId = ref<number | null>(null)
  const activeShop = ref<{
    id: number | null
    route: string
    info?: any
  }>({
    id: null,
    route: 'shop'
  })
  const activeCityTitle = ref('')
  const departmentWorkTime = ref({
    startWorkDay: '9:00',
    endWorkDay: '21:00'
  })
  const info = ref({
    activeCity: 1,
    changeCity: false,
    depEntities: [] as Department[],
    depIds: [] as number[],
    address: {
      street: '',
      geo: [] as number[],
      save: false
    }
  })

  // Services
  const geoService = new GeoService()

  // Getters
  const cities = computed(() => allCitiesList.value)
  const citiesById = computed(() => allCitiesListById.value)
  const citiesByKeyName = computed(() => allCitiesListByKeyName.value)
  const currentCityId = computed(() => cityId.value)
  const currentActiveShop = computed(() => activeShop.value)
  const currentCityTitle = computed(() => activeCityTitle.value)
  const workTime = computed(() => departmentWorkTime.value)
  const geoInfo = computed(() => info.value)
  const departments = computed(() => info.value.depEntities)
  const departmentIds = computed(() => info.value.depIds)
  const currentAddress = computed(() => info.value.address)

  // Actions
  const getAllCities = async () => {
    try {
      const data = await geoService.getAllCities()
      
      if (data.type !== 'success') {
        return
      }

      const cities = data.data || []
      allCitiesList.value = cities

      // Создаем индексы для быстрого поиска
      const byId: Record<number, City> = {}
      const byKeyName: Record<string, City> = {}

      cities.forEach(city => {
        byId[city.id] = city
        byKeyName[city.nameEn] = city
      })

      allCitiesListById.value = byId
      allCitiesListByKeyName.value = byKeyName

      return data
    } catch (error) {
      console.error('Ошибка получения городов:', error)
      throw error
    }
  }

  const getDepartmentByAddress = async (pointCoords: { lat: number; lng: number }) => {
    if (!pointCoords) return

    try {
      const data = await geoService.findDepartmentsByAddress({
        lat: pointCoords.lat,
        lng: pointCoords.lng
      })

      if (data && data.departments) {
        const depIds = data.departments.map(dep => dep.id)
        const depEntities = data.departments.map(dep => ({
          id: dep.id,
          departmentId: dep.id,
          name: dep.name,
          address: dep.address.street + ' ' + dep.address.house,
          minOrderSum: dep.minOrderSum,
          minOrderSumDelivery: dep.minOrderSumDelivery,
          totalDeliveryPrice: dep.totalDeliveryPrice,
          departmentIsAyan: dep.isAyan,
          departmentIsFavorite: dep.departmentIsFavorite,
          paymentType: dep.paymentType?.[0],
          packetStep: dep.packagePriceStep,
          img: dep.departmentImage,
          departmentGroup: dep.departmentGroup
        }))

        clearActiveShop()
        setDepartmentsList({ depIds, depEntities })
        updateCity()
        
        const departmentsCookie = useCookie('availableDepartments')
        departmentsCookie.value = depIds
      }

      return data
    } catch (error) {
      console.error('Ошибка получения департаментов по адресу:', error)
      if (process.client) {
        // Показываем уведомление об ошибке
        console.warn('Произошла ошибка выбора адреса, попробуйте еще раз пожалуйста')
      }
      throw error
    }
  }

  const getCityLocal = () => {
    setAllLocal()
  }

  const changeCity = (id: number) => {
    changeCityMutation(id)
    clearAddress()
    updateCity()
  }

  const changeAddressStatus = (status: boolean) => {
    changeAddressStatusMutation(status)
    updateCity()
  }

  const saveAddress = (data: { street: string; geo: number[]; department: number }) => {
    saveAddressMutation(data)
    updateCity()
  }

  const setCityTitle = (data: string) => {
    activeCityTitle.value = data
  }

  const setActiveShop = async (data: { id: number; route: string }) => {
    try {
      const resp = await $fetch(`/api/site/provider/department/profile/${data.id}`)
      data.info = resp
      activeShop.value = data
    } catch (error) {
      console.error('Ошибка получения информации о магазине:', error)
      throw error
    }
  }

  const removeActiveShop = () => {
    clearActiveShop()
  }

  const getGeoCoords = (cityId: number) => {
    const city = allCitiesListById.value[cityId]
    if (city) {
      // Возвращаем координаты города (нужно будет добавить в API)
      return { lat: 43.2220, lng: 76.8512 } // Алматы по умолчанию
    }
    return null
  }

  // Mutations (локальные изменения состояния)
  const setAllLocal = () => {
    let info
    if (process.client) {
      info = localStorage.getItem('info')
    }
    if (info) {
      info.value = JSON.parse(info)
    } else if (process.client) {
      const defaultInfo = {
        activeCity: 1,
        changeCity: false,
        depEntities: [],
        address: {
          street: '',
          geo: [],
          save: false
        }
      }
      localStorage.setItem('info', JSON.stringify(defaultInfo))
      info.value = defaultInfo
    }
  }

  const changeCityMutation = (cityId: number) => {
    cityId.value = cityId
    activeCityTitle.value = allCitiesListById.value[cityId]?.name || ''
    info.value.activeCity = cityId
    if (info.value.changeCity === false) {
      info.value.changeCity = true
    }
  }

  const changeAddressStatusMutation = (status: boolean) => {
    info.value.address.save = status
    if (status === false) {
      info.value.address.street = ''
      info.value.address.geo = []
      info.value.activeDepartment = 0
    }
  }

  const saveAddressMutation = (data: { street: string; geo: number[]; department: number }) => {
    info.value.address.street = data.street
    info.value.address.geo = data.geo
    info.value.activeDepartment = data.department
  }

  const clearAddress = () => {
    info.value.address.street = ''
    info.value.address.geo = []
    info.value.address.save = false
  }

  const setDepartmentsList = (data: { depIds: number[]; depEntities: Department[] }) => {
    info.value.depEntities = data.depEntities
    info.value.depIds = data.depIds
  }

  const clearActiveShop = () => {
    activeShop.value.id = null
    activeShop.value.route = 'shop'
  }

  const updateCity = () => {
    if (process.client) {
      localStorage.setItem('info', JSON.stringify(info.value))
    }
  }

  return {
    // State
    allCitiesList: readonly(allCitiesList),
    allCitiesListById: readonly(allCitiesListById),
    allCitiesListByKeyName: readonly(allCitiesListByKeyName),
    cityId: readonly(cityId),
    activeShop: readonly(activeShop),
    activeCityTitle: readonly(activeCityTitle),
    departmentWorkTime: readonly(departmentWorkTime),
    info: readonly(info),
    
    // Getters
    cities,
    citiesById,
    citiesByKeyName,
    currentCityId,
    currentActiveShop,
    currentCityTitle,
    workTime,
    geoInfo,
    departments,
    departmentIds,
    currentAddress,
    
    // Actions
    getAllCities,
    getDepartmentByAddress,
    getCityLocal,
    changeCity,
    changeAddressStatus,
    saveAddress,
    setCityTitle,
    setActiveShop,
    removeActiveShop,
    getGeoCoords
  }
})
