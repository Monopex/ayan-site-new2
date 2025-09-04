import { defineStore } from 'pinia'

export const useSEOStore = defineStore('seo', () => {
  // State
  const UTM = ref<any>({})

  // Getters
  const utmData = computed(() => UTM.value)

  // Actions
  const setSeoUtm = (data: any) => {
    UTM.value = data
  }

  return {
    // State
    UTM: readonly(UTM),
    
    // Getters
    utmData,
    
    // Actions
    setSeoUtm
  }
})
