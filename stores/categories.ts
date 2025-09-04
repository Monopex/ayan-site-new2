import { defineStore } from 'pinia'
import { CategoriesService } from '~/composables/api'

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

// Вспомогательная функция для «выпрямления» дерева категорий в плоский массив
function flattenCategories(categories: ProductCategory[], result: ProductCategory[] = []): ProductCategory[] {
  categories.forEach((category) => {
    result.push(category)
    if (category.children && category.children.length) {
      flattenCategories(category.children, result)
    }
  })
  return result
}

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const catalogCategories = ref<ProductCategory[]>([])
  const showcaseCategories = ref<ProductCategory[]>([])
  const availableCategory = ref<Record<string, ProductCategory>>({})
  const hoverPanelCategories = ref<ProductCategory[]>([])
  const departmentCategories = ref<ProductCategory[]>([])
  const webCategory = ref<ProductCategory[]>([])

  // Services
  const categoriesService = new CategoriesService()

  // Getters
  const categories = computed(() => catalogCategories.value)
  const showcase = computed(() => showcaseCategories.value)
  const available = computed(() => availableCategory.value)
  const hoverPanel = computed(() => hoverPanelCategories.value)
  const department = computed(() => departmentCategories.value)
  const web = computed(() => webCategory.value)

  // Actions
  const getHoverPanelCategories = async (availableDepartments?: number[]) => {
    try {
      const deps = availableDepartments || []
      let response = await categoriesService.getAllMainCategories(deps)

      // Фильтруем «нежелательную» подкатегорию
      response = response.map((cat) => {
        if (cat.id === '170412' && Array.isArray(cat.children)) {
          cat.children = cat.children.filter(c => c.id !== '122')
        }
        return cat
      })

      // Собираем всё дерево в плоский массив и один раз коммитим
      const allCats = flattenCategories(response)
      setAvailableCategories(allCats)

      // Оригинальные сторы остаются без изменений
      catalogCategories.value = response
      hoverPanelCategories.value = response

      return response
    } catch (error) {
      console.error('Ошибка получения категорий hover-панели:', error)
      throw error
    }
  }

  const getShowcaseCategories = async (payload: number[]) => {
    try {
      let data = await categoriesService.getShowcaseCategories({ departmentIds: payload })
      data = data.filter(category => category.id !== '122')
      showcaseCategories.value = data
      return data
    } catch (error) {
      console.error('Ошибка получения категорий витрины:', error)
      throw error
    }
  }

  const getCategoryById = async (categoryId: string) => {
    try {
      const departments = useCookie('availableDepartments').value || []
      const payload = { departments, categoryId }
      const data = await categoriesService.getCategoryById(payload)
      
      if (!data) return

      if (categoryId === '170412' && Array.isArray(data.children)) {
        data.children = data.children.filter(c => c.id !== '122')
      }

      // Пушим сам узел + его прямых детей
      const catsToCache = [data]
      if (data.children && data.children.length) {
        catsToCache.push(...data.children)
      }
      setAvailableCategories(catsToCache)

      return data
    } catch (error) {
      console.error('Ошибка получения категории по ID:', error)
      throw error
    }
  }

  const getCategoriesByDepartment = async () => {
    try {
      const data = await categoriesService.getDepartmentCategories()
      departmentCategories.value = data
      return data
    } catch (error) {
      console.error('Ошибка получения категорий по департаменту:', error)
      throw error
    }
  }

  const removeFromAvailable = (id: string) => {
    removeAvailableCategory(id)
  }

  const getWebCategoryById = async (categoryId: string) => {
    try {
      // Этот метод нужно будет добавить в CategoriesService
      // const data = await categoriesService.getWebCategoryById(categoryId)
      // webCategory.value = data
      // return data
      console.warn('getWebCategoryById не реализован в новом API')
      return null
    } catch (error) {
      console.error('Ошибка получения веб-категории по ID:', error)
      throw error
    }
  }

  // Mutations (локальные изменения состояния)
  const setAvailableCategories = (categoriesArray: ProductCategory[]) => {
    // Сливаем старые и новые в один объект
    const merged = { ...availableCategory.value }
    categoriesArray.forEach((cat) => {
      merged[cat.id] = cat
    })
    // Переназначаем ссылку: Vue отработает реактивность один раз
    availableCategory.value = merged
  }

  const removeAvailableCategory = (id: string) => {
    availableCategory.value[id] = null as any
  }

  return {
    // State
    catalogCategories: readonly(catalogCategories),
    showcaseCategories: readonly(showcaseCategories),
    availableCategory: readonly(availableCategory),
    hoverPanelCategories: readonly(hoverPanelCategories),
    departmentCategories: readonly(departmentCategories),
    webCategory: readonly(webCategory),
    
    // Getters
    categories,
    showcase,
    available,
    hoverPanel,
    department,
    web,
    
    // Actions
    getHoverPanelCategories,
    getShowcaseCategories,
    getCategoryById,
    getCategoriesByDepartment,
    removeFromAvailable,
    getWebCategoryById
  }
})
