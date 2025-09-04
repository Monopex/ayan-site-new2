import { ref, computed } from 'vue'
import { ProductsService } from '../services/products.service'
import type { 
  Product, 
  ProductCategory, 
  SearchParams, 
  SearchResponse, 
  FilterParams,
  PaginatedResponse,
  Review
} from '../core/types'

const productsService = new ProductsService()

export const useProducts = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const searchResults = ref<SearchResponse | null>(null)
  const categories = ref<ProductCategory[]>([])
  const recentProducts = ref<Product[]>([])
  const frequentlyPurchased = ref<Product[]>([])

  // Вычисляемые свойства
  const hasProducts = computed(() => products.value.length > 0)
  const hasSearchResults = computed(() => searchResults.value?.searchResult?.content?.length > 0)
  const totalPages = computed(() => searchResults.value?.searchResult?.totalPages || 0)
  const totalElements = computed(() => searchResults.value?.searchResult?.totalElements || 0)

  // Методы для работы с продуктами
  const fetchProductsByCategory = async (params: {
    categoryId: string
    departmentIds: number[]
    page?: number
    size?: number
  }): Promise<SearchResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.getProductsByCategory(params)
      products.value = response.searchResult?.content || []
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке продуктов'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchProductById = async (productId: string): Promise<Product | null> => {
    loading.value = true
    error.value = null

    try {
      const product = await productsService.getProductById(productId)
      currentProduct.value = product
      return product
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке продукта'
      return null
    } finally {
      loading.value = false
    }
  }

  const searchProducts = async (params: SearchParams): Promise<SearchResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.searchProducts(params)
      searchResults.value = response
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при поиске продуктов'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchFilteredProducts = async (params: FilterParams): Promise<SearchResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.getFilteredProducts(params)
      products.value = response.searchResult?.content || []
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при фильтрации продуктов'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchRecentProducts = async (departmentIds: number[]): Promise<Product[]> => {
    loading.value = true
    error.value = null

    try {
      const products = await productsService.getRecentProducts(departmentIds)
      recentProducts.value = products
      return products
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке недавних продуктов'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchFrequentlyPurchased = async (departmentIds: number[]): Promise<Product[]> => {
    loading.value = true
    error.value = null

    try {
      const products = await productsService.getFrequentlyPurchasedProducts(departmentIds)
      frequentlyPurchased.value = products
      return products
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке часто покупаемых продуктов'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchShowcaseProducts = async (departmentIds: number[]): Promise<Record<string, Product[]> | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.getShowcaseProducts(departmentIds)
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке продуктов витрины'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchDefaultShowcaseProducts = async (): Promise<Record<string, Product[]> | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.getDefaultShowcaseProducts()
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке продуктов витрины по умолчанию'
      return null
    } finally {
      loading.value = false
    }
  }

  // Методы для работы с отзывами
  const fetchProductReviews = async (params: {
    providerProductId: string
    page?: number
    size?: number
  }): Promise<PaginatedResponse<Review> | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await productsService.getProductReviews(params)
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке отзывов'
      return null
    } finally {
      loading.value = false
    }
  }

  const likeReview = async (reviewId: string): Promise<boolean> => {
    try {
      await productsService.likeReview(reviewId)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при лайке отзыва'
      return false
    }
  }

  const dislikeReview = async (reviewId: string): Promise<boolean> => {
    try {
      await productsService.dislikeReview(reviewId)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при дизлайке отзыва'
      return false
    }
  }

  const unlikeReview = async (reviewId: string): Promise<boolean> => {
    try {
      await productsService.unlikeReview(reviewId)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при убирании лайка'
      return false
    }
  }

  const undislikeReview = async (reviewId: string): Promise<boolean> => {
    try {
      await productsService.undislikeReview(reviewId)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при убирании дизлайка'
      return false
    }
  }

  const fetchReviewImages = async (providerProductId: string): Promise<string[]> => {
    try {
      const images = await productsService.getReviewImages(providerProductId)
      return images
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке изображений отзывов'
      return []
    }
  }

  const reportBrokenImage = async (productId: string): Promise<boolean> => {
    try {
      await productsService.reportBrokenImage(productId)
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка при отправке жалобы на изображение'
      return false
    }
  }

  // Утилиты
  const clearProducts = () => {
    products.value = []
    currentProduct.value = null
    searchResults.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const invalidateCache = () => {
    productsService.invalidateProductsCache()
  }

  const invalidateProductCache = (productId: string) => {
    productsService.invalidateProductCache(productId)
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    products: readonly(products),
    currentProduct: readonly(currentProduct),
    searchResults: readonly(searchResults),
    categories: readonly(categories),
    recentProducts: readonly(recentProducts),
    frequentlyPurchased: readonly(frequentlyPurchased),
    
    // Вычисляемые свойства
    hasProducts,
    hasSearchResults,
    totalPages,
    totalElements,
    
    // Методы
    fetchProductsByCategory,
    fetchProductById,
    searchProducts,
    fetchFilteredProducts,
    fetchRecentProducts,
    fetchFrequentlyPurchased,
    fetchShowcaseProducts,
    fetchDefaultShowcaseProducts,
    fetchProductReviews,
    likeReview,
    dislikeReview,
    unlikeReview,
    undislikeReview,
    fetchReviewImages,
    reportBrokenImage,
    clearProducts,
    clearError,
    invalidateCache,
    invalidateProductCache
  }
}
