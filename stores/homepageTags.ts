import { defineStore } from 'pinia'

export const useHomepageTagsStore = defineStore('homepageTags', () => {
  // State
  const tags = ref<any[]>([])

  // Getters
  const allTags = computed(() => tags.value)

  // Actions
  const getHomepageTagsByCity = async (payload: any) => {
    try {
      // const data = await this.$api.HomepageTags.getHomepageTagsByCity(payload)
      // tags.value = data
      console.warn('getHomepageTagsByCity не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка при загрузке homepage тегов:', error)
      return null
    }
  }

  const clearHomepageTags = () => {
    tags.value = []
  }

  return {
    // State
    tags: readonly(tags),
    
    // Getters
    allTags,
    
    // Actions
    getHomepageTagsByCity,
    clearHomepageTags
  }
})
