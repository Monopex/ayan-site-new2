import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const meta = ref<any>({})
  const unreviewedCount = ref(0)

  // Getters
  const metaData = computed(() => meta.value)
  const unreviewedCountValue = computed(() => unreviewedCount.value)

  // Actions
  const sendReview = async (payload: any) => {
    try {
      // return await this.$axios.post(`${API}client/provider/order/review/post`, payload)
      console.warn('sendReview не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка отправки отзыва:', error)
      return { type: 'error' }
    }
  }

  const getTags = async (rating: number) => {
    try {
      // return await this.$axios.get(`${API}client/provider/order/review/tags/${rating}`)
      console.warn('getTags не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения тегов отзыва:', error)
      return { type: 'error' }
    }
  }

  const clearUnreviewedCount = () => {
    unreviewedCount.value = 0
  }

  const createProductReview = async (payload: any) => {
    try {
      // const response = await this.$api.Reviews.createReview(payload, this.app.$cookies.get('TOKEN'))
      // if (response.type === 'success') {
      //   meta.value = response.data
      // }
      // await getUnreviewedCount()
      // return response
      console.warn('createProductReview не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка при создании отзыва на продукт:', error)
      return { type: 'error' }
    }
  }

  const getReviews = async (payload: any) => {
    try {
      // return await this.$api.Reviews.getProductReview(payload, this.app.$cookies.get('TOKEN'))
      console.warn('getReviews не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка получения отзывов:', error)
      return { type: 'error' }
    }
  }

  const plusLike = async (payload: any) => {
    try {
      // await this.$api.Reviews.plusLike(payload, this.app.$cookies.get('TOKEN'))
      console.warn('plusLike не реализован в новом API')
    } catch (error) {
      console.error('Ошибка лайка отзыва:', error)
    }
  }

  const minusLike = async (payload: any) => {
    try {
      // await this.$api.Reviews.minusLike(payload, this.app.$cookies.get('TOKEN'))
      console.warn('minusLike не реализован в новом API')
    } catch (error) {
      console.error('Ошибка отмены лайка отзыва:', error)
    }
  }

  const plusDislike = async (payload: any) => {
    try {
      // await this.$api.Reviews.plusDislike(payload, this.app.$cookies.get('TOKEN'))
      console.warn('plusDislike не реализован в новом API')
    } catch (error) {
      console.error('Ошибка дизлайка отзыва:', error)
    }
  }

  const minusDislike = async (payload: any) => {
    try {
      // await this.$api.Reviews.minusDislike(payload, this.app.$cookies.get('TOKEN'))
      console.warn('minusDislike не реализован в новом API')
    } catch (error) {
      console.error('Ошибка отмены дизлайка отзыва:', error)
    }
  }

  const downloadReviewFoto = async (payload: any) => {
    try {
      // const data = await this.$api.Reviews.downloadReviewFoto(payload, this.app.$cookies.get('TOKEN'))
      // return data
      console.warn('downloadReviewFoto не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка загрузки фото отзыва:', error)
      return null
    }
  }

  const uploadReviewMediaAll = async ({ orderId, files }: { orderId: string; files: FormData }) => {
    try {
      // const token = this.app.$cookies.get('TOKEN')
      // const data = await this.$api.Reviews.uploadOrderReviewMediaAll({ orderId, files }, token)
      // return data
      console.warn('uploadReviewMediaAll не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка загрузки медиа отзыва:', error)
      return []
    }
  }

  const checkReview = async ({ clientId, productId }: { clientId: string; productId: string }) => {
    try {
      // const response = await this.$api.Reviews.checkReview(clientId, productId, this.app.$cookies.get('TOKEN'))
      // return response
      console.warn('checkReview не реализован в новом API')
      return false
    } catch (error) {
      console.error('Ошибка проверки отзыва:', error)
      return { type: 'error' }
    }
  }

  const getUnreviewedCount = async () => {
    try {
      // const token = this.app.$cookies.get('TOKEN')
      // const raw = this.app.$cookies.get('availableDepartments') || '[]'
      // let departmentIds = []
      // try {
      //   departmentIds = Array.isArray(raw) ? raw : JSON.parse(raw)
      // } catch (e) {
      //   console.error('Парсинг availableDepartments:', e)
      // }
      // const res = await this.$api.Reviews.getUnreviewed({ departmentIds }, token)
      // const items = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
      // const count = items.length
      // unreviewedCount.value = count
      // return count
      console.warn('getUnreviewedCount не реализован в новом API')
      return 0
    } catch (error) {
      console.error('Ошибка получения количества неоцененных товаров:', error)
      return 0
    }
  }

  return {
    // State
    meta: readonly(meta),
    unreviewedCount: readonly(unreviewedCount),
    
    // Getters
    metaData,
    unreviewedCountValue,
    
    // Actions
    sendReview,
    getTags,
    clearUnreviewedCount,
    createProductReview,
    getReviews,
    plusLike,
    minusLike,
    plusDislike,
    minusDislike,
    downloadReviewFoto,
    uploadReviewMediaAll,
    checkReview,
    getUnreviewedCount
  }
})