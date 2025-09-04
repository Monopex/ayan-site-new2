import { ref, computed } from 'vue'
import { ElasticSearchService } from '../services/elasticsearch.service'
import type { Product, ProductCategory } from '../core/types'

const elasticSearchService = new ElasticSearchService()

export const useElasticSearch = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchResults = ref<{
    products: Product[]
    categories: ProductCategory[]
  }>({
    products: [],
    categories: []
  })
  const searchQuery = ref('')

  // Вычисляемые свойства
  const hasResults = computed(() => 
    searchResults.value.products.length > 0 || searchResults.value.categories.length > 0
  )
  const hasProducts = computed(() => searchResults.value.products.length > 0)
  const hasCategories = computed(() => searchResults.value.categories.length > 0)
  const totalResults = computed(() => 
    searchResults.value.products.length + searchResults.value.categories.length
  )

  // Методы поиска
  const searchAll = async (params: {
    name: string
    departmentId: number | number[]
    productSize?: number
    categorySize?: number
    language?: string
  }): Promise<{
    products: Product[]
    categories: ProductCategory[]
  }> => {
    loading.value = true
    error.value = null
    searchQuery.value = params.name

    try {
      const results = await elasticSearchService.searchWithAutocomplete(params)
      searchResults.value = results
      return results
    } catch (err: any) {
      error.value = err.message || 'Ошибка при поиске'
      return { products: [], categories: [] }
    } finally {
      loading.value = false
    }
  }

  const searchProducts = async (params: {
    name: string
    departmentId: number | number[]
    productSize?: number
    language?: string
  }): Promise<Product[]> => {
    loading.value = true
    error.value = null
    searchQuery.value = params.name

    try {
      const products = await elasticSearchService.searchProducts(params)
      searchResults.value.products = products
      return products
    } catch (err: any) {
      error.value = err.message || 'Ошибка при поиске продуктов'
      return []
    } finally {
      loading.value = false
    }
  }

  const searchCategories = async (params: {
    name: string
    departmentId: number | number[]
    categorySize?: number
    language?: string
  }): Promise<ProductCategory[]> => {
    loading.value = true
    error.value = null
    searchQuery.value = params.name

    try {
      const categories = await elasticSearchService.searchCategories(params)
      searchResults.value.categories = categories
      return categories
    } catch (err: any) {
      error.value = err.message || 'Ошибка при поиске категорий'
      return []
    } finally {
      loading.value = false
    }
  }

  // Утилиты
  const clearResults = (): void => {
    searchResults.value = { products: [], categories: [] }
    searchQuery.value = ''
    error.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  // Удаление дубликатов продуктов (как в старом коде)
  const removeDuplicateProducts = (products: Product[]): Product[] => {
    return products.filter((product, index, self) =>
      index === self.findIndex(p => p.providerProductId === product.providerProductId)
    )
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    searchResults: readonly(searchResults),
    searchQuery: readonly(searchQuery),
    
    // Вычисляемые свойства
    hasResults,
    hasProducts,
    hasCategories,
    totalResults,
    
    // Методы
    searchAll,
    searchProducts,
    searchCategories,
    clearResults,
    clearError,
    removeDuplicateProducts
  }
}
