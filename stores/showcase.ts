import { defineStore } from 'pinia'
import { ShowcaseService } from '~/composables/api'

export const useShowcaseStore = defineStore('showcase', () => {
  // State
  const showcaseTypes = ref<any[]>([])
  const showcases = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Services
  const showcaseService = new ShowcaseService()

  // Getters
  const types = computed(() => showcaseTypes.value)
  const showcasesList = computed(() => showcases.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Actions
  const getShowcaseTypes = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await showcaseService.getShowcaseTypes()
      showcaseTypes.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Ошибка получения типов витрин'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getShowcases = async (params: { departmentIds: number[]; types?: string[]; page?: number; size?: number }) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await showcaseService.getShowcases(params)
      showcases.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Ошибка получения витрин'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    showcaseTypes: readonly(showcaseTypes),
    showcases: readonly(showcases),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    types,
    showcasesList,
    isLoading,
    hasError,
    
    // Actions
    getShowcaseTypes,
    getShowcases,
    clearError
  }
})
