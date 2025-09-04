import { defineStore } from 'pinia'

export const useStaticStore = defineStore('static', () => {
  // State
  const content = ref('')
  const banners = ref({
    slider: [],
    alone: [],
    products: [],
    four: [],
    two: [],
    one: null,
    mainSlider: []
  })
  const payload = ref('')

  // Getters
  const pageContent = computed(() => content.value)
  const bannersData = computed(() => banners.value)
  const mainSlider = computed(() => banners.value.mainSlider)

  // Actions
  const getPage = async ({ payload: pagePayload }: { payload: string }) => {
    try {
      let localization = 'ru'
      // const localStorageLocalization = this.app.$cookies.get('localization')
      // if (localizationLocalization === 'kz') {
      //   localization = localizationLocalization
      //   i18n.locale = 'kz'
      // }
      // const response = await this.$api.Static.getStaticPage(localization, pagePayload)
      // content.value = response.content
      // payload.value = pagePayload
      console.warn('getPage не реализован в новом API')
      return null
    } catch (error) {
      console.error('Error fetching page:', error)
      return null
    }
  }

  const getBanners = async (payload: any) => {
    try {
      // const data = await this.$api.Static.getBanners(payload)
      // if (data.type === 'success') {
      //   const sliderBanners = []
      //   const categoryBanners = []
      //   const productBanners = []
      //   const fourBanners = []
      //   const twoBanners = []
      //   let oneBanners = null
      //   const mainSliderBanners = []

      //   data.data.forEach((element) => {
      //     if (element.bannerType) {
      //       if (element.bannerType.id === 1) {
      //         sliderBanners.push(element)
      //       }
      //       if (element.bannerType.id === 2) {
      //         categoryBanners.push(element)
      //       }
      //       if (element.bannerType.id === 3) {
      //         productBanners.push(element)
      //       }
      //       if (element.bannerType.id === 6) {
      //         fourBanners.push(element)
      //       }
      //       if (element.bannerType.id === 7) {
      //         twoBanners.push(element)
      //       }
      //       if (element.bannerType.id === 8) {
      //         oneBanners = element
      //       }
      //       if (element.bannerType.id === 9) {
      //         mainSliderBanners.push(element)
      //       }
      //     }
      //   })
      //   banners.value.four = fourBanners
      //   banners.value.two = twoBanners
      //   banners.value.one = oneBanners
      //   banners.value.slider = sliderBanners
      //   banners.value.alone = categoryBanners
      //   banners.value.products = productBanners
      //   banners.value.mainSlider = mainSliderBanners
      // }
      console.warn('getBanners не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения баннеров:', error)
      return []
    }
  }

  const getCategoryBanner = async (categoryId: string) => {
    try {
      // const data = await this.$api.Static.getGategoryBanner({ 
      //   categoryId, 
      //   departments: this.$cookies.get('availableDepartments') || [5] 
      // })
      // if (data.type !== 'error') {
      //   return data
      // }
      console.warn('getCategoryBanner не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения баннера категории:', error)
      return []
    }
  }

  const saveLocalizationToLocalStorage = (language: string) => {
    // this.app.$cookies.set('localization', language)
    // i18n.locale = 'kz'
    console.warn('saveLocalizationToLocalStorage не реализован в новом API')
  }

  const deleteLocalizationLocalStorage = () => {
    // this.app.$cookies.set('localization', 'ru')
    // i18n.locale = 'ru'
    console.warn('deleteLocalizationLocalStorage не реализован в новом API')
  }

  const checkLocaleLS = () => {
    // if (this.app.$cookies.get('localization') === 'kz') {
    //   i18n.locale = 'kz'
    // }
    console.warn('checkLocaleLS не реализован в новом API')
  }

  return {
    // State
    content: readonly(content),
    banners: readonly(banners),
    payload: readonly(payload),
    
    // Getters
    pageContent,
    bannersData,
    mainSlider,
    
    // Actions
    getPage,
    getBanners,
    getCategoryBanner,
    saveLocalizationToLocalStorage,
    deleteLocalizationLocalStorage,
    checkLocaleLS
  }
})