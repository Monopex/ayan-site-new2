import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const pageableProductsList = ref<any>({})
  const departmentsList = ref<any[]>([])

  // Getters
  const favoriteDepartments = computed(() => departmentsList.value)
  const favoriteProducts = computed(() => pageableProductsList.value)

  // Actions
  const getFavDepartments = async (clientId: string) => {
    try {
      // const response = await this.$api.Favorites.getDepartments(
      //   clientId,
      //   this.app.$cookies.get("TOKEN")
      // )
      // departmentsList.value = response
      // return response
      console.warn('getFavDepartments не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения избранных департаментов:', error)
      return []
    }
  }

  const addDepartmentToFav = async (input: any) => {
    try {
      // const response = await this.$api.Favorites.addDepartment(
      //   input,
      //   this.app.$cookies.get("TOKEN")
      // )
      // return response
      console.warn('addDepartmentToFav не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка добавления департамента в избранное:', error)
      return { type: 'error' }
    }
  }

  const removeDepartmentFromFav = async (input: any) => {
    try {
      // const response = await this.$api.Favorites.deleteDepartment(
      //   input,
      //   this.app.$cookies.get("TOKEN")
      // )
      // return response
      console.warn('removeDepartmentFromFav не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка удаления департамента из избранного:', error)
      return { type: 'error' }
    }
  }

  const getFavProductsWithFilter = async (input: any) => {
    try {
      // const response = await this.$api.Favorites.getProductsWithFilter(
      //   input,
      //   this.app.$cookies.get("TOKEN")
      // )
      // pageableProductsList.value = response
      // return response
      console.warn('getFavProductsWithFilter не реализован в новом API')
      return {}
    } catch (error) {
      console.error('Ошибка получения избранных товаров с фильтром:', error)
      return {}
    }
  }

  const getFavProducts = async (input: any) => {
    try {
      // const response = await this.$api.Favorites.getProducts(
      //   input,
      //   this.app.$cookies.get("TOKEN")
      // )
      // pageableProductsList.value = response.searchResult
      // const productsInfo = {
      //   maxPrice: response.maxPrice,
      //   providerIds: response.providerIds,
      //   categoryIds: response.categoryIdsForDiscount,
      //   departmentIds: response.departmentIds || [],
      //   feature: response.feature || []
      // }
      // return productsInfo
      console.warn('getFavProducts не реализован в новом API')
      return {}
    } catch (error) {
      console.error('Ошибка получения избранных товаров:', error)
      return {}
    }
  }

  const addProductToFav = async (productId: string) => {
    try {
      // const headers = {
      //   "device-type": this.app.$cookies.get("device-type") || "",
      //   "device-uuid": this.app.$cookies.get("device-uuid") || ""
      // }
      // const response = await this.$api.Favorites.addProduct(
      //   productId,
      //   this.app.$cookies.get("TOKEN"),
      //   headers
      // )
      // return response
      console.warn('addProductToFav не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка добавления товара в избранное:', error)
      return { type: 'error' }
    }
  }

  const removeProductFromFav = async (productId: string) => {
    try {
      // const headers = {
      //   "device-type": this.app.$cookies.get("device-type") || "",
      //   "device-uuid": this.app.$cookies.get("device-uuid") || ""
      // }
      // const response = await this.$api.Favorites.deleteProduct(
      //   productId,
      //   this.app.$cookies.get("TOKEN"),
      //   headers
      // )
      // if (!response && pageableProductsList.value.content) {
      //   const idInList = pageableProductsList.value.content.findIndex(
      //     el => productId === el.providerProductId
      //   )
      //   if (idInList > -1) {
      //     pageableProductsList.value.content.splice(idInList, 1)
      //   }
      // }
      // return response
      console.warn('removeProductFromFav не реализован в новом API')
      return { type: 'error' }
    } catch (error) {
      console.error('Ошибка удаления товара из избранного:', error)
      return { type: 'error' }
    }
  }

  return {
    // State
    pageableProductsList: readonly(pageableProductsList),
    departmentsList: readonly(departmentsList),
    
    // Getters
    favoriteDepartments,
    favoriteProducts,
    
    // Actions
    getFavDepartments,
    addDepartmentToFav,
    removeDepartmentFromFav,
    getFavProductsWithFilter,
    getFavProducts,
    addProductToFav,
    removeProductFromFav
  }
})