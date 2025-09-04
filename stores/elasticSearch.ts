import { defineStore } from 'pinia'
import { ElasticSearchService } from '~/composables/api'

export const useElasticSearchStore = defineStore('elasticSearch', () => {
  // State
  const topProducts = ref<any[]>([])
  const topCategories = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Services
  const elasticSearchService = new ElasticSearchService()

  // Getters
  const products = computed(() => topProducts.value)
  const categories = computed(() => topCategories.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasResults = computed(() => topProducts.value.length > 0 || topCategories.value.length > 0)

  // Actions
  const searchAllInElastic = async (params: {
    name: string
    departmentId: number | number[]
    productSize?: number
    categorySize?: number
    language?: string
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await elasticSearchService.searchAllInElastic(params)
      topProducts.value = response.productData || []
      topCategories.value = response.categoryData || []
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка поиска'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDataInElastic = async (params: {
    name: string
    departmentId: number | number[]
    productSize?: number
    categorySize?: number
    language?: string
  }) => {
    const response = await searchAllInElastic(params)
    setTopProducts(response.productData || [])
    setTopCategories(response.categoryData || [])
    return response
  }

  const clearData = () => {
    topProducts.value = []
    topCategories.value = []
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Mutations (локальные изменения состояния)
  const setTopProducts = (data: any[]) => {
    if (data !== null && data.length > 0) {
      topProducts.value = data
    } else {
      topProducts.value = []
    }
  }

  const setTopCategories = (data: any[]) => {
    if (data !== null && data.length > 0) {
      topCategories.value = data
    } else {
      topCategories.value = []
    }
  }

  return {
    // State
    topProducts: readonly(topProducts),
    topCategories: readonly(topCategories),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    products,
    categories,
    isLoading,
    hasError,
    hasResults,
    
    // Actions
    searchAllInElastic,
    getDataInElastic,
    clearData,
    clearError
  }
})
