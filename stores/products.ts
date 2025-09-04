import { defineStore } from 'pinia'
import { ProductsService } from '~/composables/api'

export interface Product {
  providerProductId: string
  productId: string
  providerId: string
  departmentId: string
  name: string
  nameKz?: string
  price: number
  discountPrice?: number
  totalPrice: number
  totalDiscountPrice?: number
  amount: number
  measureType: string
  amountStep: number | string
  categoryId: string
  balance: number
  departmentIsAyan: boolean
  isFavorite?: boolean
  images?: string[]
  description?: string
  descriptionKz?: string
  features?: string[]
  rating?: number
  reviewCount?: number
}

export interface ProductCategory {
  id: string
  name: string
  nameKz?: string
  parentId?: string
  children?: ProductCategory[]
  image?: string
  order: number
  isActive: boolean
}

export const useProductsStore = defineStore('products', () => {
  // State
  const all = ref<Record<string, any>>({})
  const productCategory = ref<Record<string, Product[]>>({})
  const showcaseProducts = ref<Record<string, Product[]>>({})
  const findingProducts = ref<Product[]>([])
  const shareProduct = ref<any>({})
  const filteredProducts = ref<Product[]>([])
  const scrollProducts = ref<Record<string, any>>({})
  const viewProducts = ref<Product[]>([])
  const imagesProviderProduct = ref<string[]>([])
  const currentProduct = ref<Product | null>(null)

  // Services
  const productsService = new ProductsService()

  // Getters
  const allProducts = computed(() => all.value)
  const productsByCategory = computed(() => productCategory.value)
  const showcaseProductsList = computed(() => showcaseProducts.value)
  const searchResults = computed(() => findingProducts.value)
  const sharedProduct = computed(() => shareProduct.value)
  const filteredProductsList = computed(() => filteredProducts.value)
  const scrollProductsList = computed(() => scrollProducts.value)
  const recentlyViewed = computed(() => viewProducts.value)
  const productImages = computed(() => imagesProviderProduct.value)
  const selectedProduct = computed(() => currentProduct.value)

  // Actions
  const getProductsByFilterWithPagination = async (input: any) => {
    try {
      const data = await productsService.searchProducts(input)
      setProductsSearch(data)
      
      const productsInfo = {
        maxPrice: data.maxPrice,
        providerIds: data.providerIds,
        categoryIds: data.categoryIdsForDiscount,
        departmentIds: data.departmentIds || [],
        feature: data.feature || []
      }
      
      return productsInfo
    } catch (error) {
      console.error('Ошибка поиска продуктов:', error)
      throw error
    }
  }

  const getProductById = async (productId: string) => {
    try {
      const data = await productsService.getProductById(productId)
      setCurrentProduct(data)
      return data
    } catch (error) {
      console.error('Ошибка получения продукта по ID:', error)
      return null
    }
  }

  const getRecentProducts = async (departmentIds: number[]) => {
    try {
      const products = await productsService.getRecentProducts(departmentIds)
      return products
    } catch (error) {
      console.error('Ошибка получения недавних продуктов:', error)
      return []
    }
  }

  const getFrequentlyPurchasedProducts = async (departmentIds: number[]) => {
    try {
      const products = await productsService.getFrequentlyPurchasedProducts(departmentIds)
      return products
    } catch (error) {
      console.error('Ошибка получения часто покупаемых продуктов:', error)
      return []
    }
  }

  const getProductsByCategory = async (payload: {
    categoryId: string
    departmentIds: number[]
    page?: number
    size?: number
  }) => {
    try {
      const data = await productsService.getProductsByCategory(payload)
      
      if (data.status === 'error') {
        return
      }

      setProductsByCategory({ key: payload.categoryId, ...data.searchResult })
      
      const productsInfo = {
        maxPrice: data.maxPrice,
        totalPages: data.searchResult.totalPages,
        providerIds: data.providerIds,
        categoryIds: data.categoryIdsForDiscount,
        departmentIds: data.departmentIds,
        feature: data.features
      }
      
      return productsInfo
    } catch (error) {
      console.error('Ошибка получения продуктов по категории:', error)
      throw error
    }
  }

  const getShowcaseProducts = async (input: any) => {
    // Заглушка: возвращаем пустой массив
    const data: Record<string, Product[]> = {}
    setShowcaseProducts(data)
    return data
  }

  const getDefaultShowcaseProducts = async () => {
    try {
      const data = await productsService.getDefaultShowcaseProducts()
      setShowcaseProducts(data)
      return data
    } catch (error) {
      console.error('Ошибка получения продуктов витрины по умолчанию:', error)
      throw error
    }
  }

  const findProductById = async (params: {
    productId: string
    providerId: string
    departmentId: string
  }) => {
    try {
      const data = await $fetch('/api/site/provider/product/get', {
        method: 'POST',
        body: params
      })
      return data
    } catch (error) {
      console.error('Ошибка поиска продукта по ID:', error)
      throw error
    }
  }

  const searchProduct = async (input: {
    departmentId: number[]
    name: string
    page: number
    pageSize: number
  }) => {
    try {
      const response = await $fetch('/api/site/product/find/products', {
        method: 'POST',
        body: {
          departmentId: input.departmentId,
          name: input.name,
          page: input.page,
          pageSize: input.pageSize
        }
      })
      return response
    } catch (error) {
      console.error('Ошибка поиска продукта:', error)
      return { type: 'error' }
    }
  }

  const getClearProducts = () => {
    clearProductsCategory()
  }

  const getShareProduct = async (body: any) => {
    try {
      const data = await $fetch('/api/site/provider/product/get/shared', {
        method: 'POST',
        body,
        headers: {
          TOKEN: useCookie('TOKEN').value
        }
      })
      setShareProducts(data)
      return data
    } catch (error) {
      console.error('Ошибка получения общего продукта:', error)
      setShareProducts({})
    }
  }

  const getImagesProviderProduct = async (providerProductId: string) => {
    try {
      const images = await productsService.getReviewImages(providerProductId)
      setImagesProviderProduct(images)
      return images
    } catch (error) {
      console.error('Ошибка загрузки изображений продукта:', error)
      throw error
    }
  }

  const getFilterProducts = async (filters: any) => {
    try {
      const data = await productsService.getFilteredProducts(filters)
      setFilterProducts(data)
      return data.totalPages
    } catch (error) {
      console.error('Ошибка получения отфильтрованных продуктов:', error)
      throw error
    }
  }

  const saveScrollingProducts = (products: any) => {
    setScrollingProducts(products)
  }

  const saveToViewProducts = (product: Product) => {
    setViewProducts(product)
  }

  const sendBrokenImage = async (productId: string) => {
    try {
      await productsService.reportBrokenImage(productId)
    } catch (error) {
      console.error('Ошибка отправки сломанного изображения:', error)
    }
  }

  // Mutations (локальные изменения состояния)
  const setImagesProviderProduct = (images: string[]) => {
    imagesProviderProduct.value = images
  }

  const setCurrentProduct = (product: Product) => {
    currentProduct.value = product
  }

  const setProductsByCategory = (data: { key: string; content: Product[] }) => {
    productCategory.value[data.key] = data.content
    if (data.content.length) {
      // Вызываем GTM событие
      // Vue.prototype.$Ecomerce.itemsList(data.content)
    }
  }

  const setShowcaseProducts = (data: Record<string, Product[]>) => {
    const deprecatedIds = [122, 295, 136, 614, 131, 132, 130, 135, 127, 123, 613, 124, 126, 125, 147, 142, 143, 610, 609, 608, 792, 128, 134, 133, 611, 612, 304, 607, 606]
    
    // Фильтруем запрещенные товары в категории скидки 60%
    if (data[170554]) {
      data[170554] = data[170554].filter(product => !deprecatedIds.includes(parseInt(product.categoryId)))
    }
    
    showcaseProducts.value = data
  }

  const setProductsSearch = (data: any) => {
    if (data.searchResult) {
      findingProducts.value = data.searchResult.content || []
      // Вызываем GTM событие
      if (data.searchResult.content?.length) {
        // Vue.prototype.$Ecomerce.itemsList(data.searchResult.content)
      }
    } else {
      findingProducts.value = []
    }
  }

  const setFilterProducts = (data: any) => {
    if (data) {
      filteredProducts.value = data.content || []
      if (data.content?.length) {
        // Vue.prototype.$Ecomerce.itemsList(data.content)
      }
    } else {
      filteredProducts.value = []
    }
  }

  const clearProductsCategory = () => {
    productCategory.value = {}
  }

  const setShareProducts = (data: any) => {
    shareProduct.value = data
  }

  const setScrollingProducts = (data: any) => {
    scrollProducts.value = data
  }

  const setViewProducts = (data: Product) => {
    const index = viewProducts.value.findIndex(product => product.providerProductId === data.providerProductId)
    if (index === -1) {
      if (viewProducts.value.length === 6) {
        viewProducts.value.pop()
        viewProducts.value.unshift(data)
      } else {
        viewProducts.value.unshift(data)
      }
    }
  }

  return {
    // State
    all: readonly(all),
    productCategory: readonly(productCategory),
    showcaseProducts: readonly(showcaseProducts),
    findingProducts: readonly(findingProducts),
    shareProduct: readonly(shareProduct),
    filteredProducts: readonly(filteredProducts),
    scrollProducts: readonly(scrollProducts),
    viewProducts: readonly(viewProducts),
    imagesProviderProduct: readonly(imagesProviderProduct),
    currentProduct: readonly(currentProduct),
    
    // Getters
    allProducts,
    productsByCategory,
    showcaseProductsList,
    searchResults,
    sharedProduct,
    filteredProductsList,
    scrollProductsList,
    recentlyViewed,
    productImages,
    selectedProduct,
    
    // Actions
    getProductsByFilterWithPagination,
    getProductById,
    getRecentProducts,
    getFrequentlyPurchasedProducts,
    getProductsByCategory,
    getShowcaseProducts,
    getDefaultShowcaseProducts,
    findProductById,
    searchProduct,
    getClearProducts,
    getShareProduct,
    getImagesProviderProduct,
    getFilterProducts,
    saveScrollingProducts,
    saveToViewProducts,
    sendBrokenImage
  }
})
