import { ref, computed } from 'vue'
import { FavoritesService } from '../services/favorites.service'
import type { FavoriteDepartment, FavoriteProduct } from '../core/types'

const favoritesService = new FavoritesService()

export const useFavorites = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const favoriteDepartments = ref<FavoriteDepartment[]>([])
  const favoriteProducts = ref<FavoriteProduct[]>([])
  const isProductFavorite = ref<Record<string, boolean>>({})

  // Вычисляемые свойства
  const hasFavoriteDepartments = computed(() => favoriteDepartments.value.length > 0)
  const hasFavoriteProducts = computed(() => favoriteProducts.value.length > 0)
  const favoriteProductsCount = computed(() => favoriteProducts.value.length)

  // Методы для работы с избранными департаментами
  const fetchFavoriteDepartments = async (clientId: string): Promise<FavoriteDepartment[]> => {
    loading.value = true
    error.value = null

    try {
      const departments = await favoritesService.getFavoriteDepartments(clientId)
      favoriteDepartments.value = departments
      return departments
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке избранных департаментов'
      return []
    } finally {
      loading.value = false
    }
  }

  const addFavoriteDepartment = async (departmentId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await favoritesService.addFavoriteDepartment(departmentId)
      if (result.success) {
        // Обновляем локальное состояние
        await fetchFavoriteDepartments(useCookie('clientId').value || '')
      }
      return result.success
    } catch (err: any) {
      error.value = err.message || 'Ошибка при добавлении департамента в избранное'
      return false
    } finally {
      loading.value = false
    }
  }

  const removeFavoriteDepartment = async (departmentId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await favoritesService.removeFavoriteDepartment(departmentId)
      if (result.success) {
        // Обновляем локальное состояние
        favoriteDepartments.value = favoriteDepartments.value.filter(dep => dep.id !== departmentId)
      }
      return result.success
    } catch (err: any) {
      error.value = err.message || 'Ошибка при удалении департамента из избранного'
      return false
    } finally {
      loading.value = false
    }
  }

  // Методы для работы с избранными продуктами
  const fetchFavoriteProducts = async (params: {
    page?: number
    size?: number
    departmentIds?: number[]
    categoryIds?: string[]
  } = {}): Promise<FavoriteProduct[]> => {
    loading.value = true
    error.value = null

    try {
      const result = await favoritesService.getFavoriteProducts(params)
      favoriteProducts.value = result.content
      return result.content
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке избранных продуктов'
      return []
    } finally {
      loading.value = false
    }
  }

  const addFavoriteProduct = async (productId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await favoritesService.addFavoriteProduct(productId)
      if (result.success) {
        // Обновляем локальное состояние
        isProductFavorite.value[productId] = true
        await fetchFavoriteProducts()
      }
      return result.success
    } catch (err: any) {
      error.value = err.message || 'Ошибка при добавлении продукта в избранное'
      return false
    } finally {
      loading.value = false
    }
  }

  const removeFavoriteProduct = async (productId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await favoritesService.removeFavoriteProduct(productId)
      if (result.success) {
        // Обновляем локальное состояние
        isProductFavorite.value[productId] = false
        favoriteProducts.value = favoriteProducts.value.filter(product => product.productId !== productId)
      }
      return result.success
    } catch (err: any) {
      error.value = err.message || 'Ошибка при удалении продукта из избранного'
      return false
    } finally {
      loading.value = false
    }
  }

  const checkIsProductFavorite = async (productId: string): Promise<boolean> => {
    try {
      const isFavorite = await favoritesService.isProductFavorite(productId)
      isProductFavorite.value[productId] = isFavorite
      return isFavorite
    } catch (err: any) {
      isProductFavorite.value[productId] = false
      return false
    }
  }

  const getFavoriteProductsCount = async (): Promise<number> => {
    try {
      const count = await favoritesService.getFavoriteProductsCount()
      return count
    } catch (err: any) {
      return 0
    }
  }

  // Утилиты
  const clearError = (): void => {
    error.value = null
  }

  const clearFavorites = (): void => {
    favoriteDepartments.value = []
    favoriteProducts.value = []
    isProductFavorite.value = {}
  }

  return {
    // Состояние
    loading: readonly(loading),
    error: readonly(error),
    favoriteDepartments: readonly(favoriteDepartments),
    favoriteProducts: readonly(favoriteProducts),
    isProductFavorite: readonly(isProductFavorite),
    
    // Вычисляемые свойства
    hasFavoriteDepartments,
    hasFavoriteProducts,
    favoriteProductsCount,
    
    // Методы
    fetchFavoriteDepartments,
    addFavoriteDepartment,
    removeFavoriteDepartment,
    fetchFavoriteProducts,
    addFavoriteProduct,
    removeFavoriteProduct,
    checkIsProductFavorite,
    getFavoriteProductsCount,
    clearError,
    clearFavorites
  }
}
