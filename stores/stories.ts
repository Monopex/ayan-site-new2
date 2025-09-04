import { defineStore } from 'pinia'

export const useStoriesStore = defineStore('stories', () => {
  // State
  const stories = ref<any[]>([])
  const progress = ref<Record<string, number>>({})

  // Getters
  const allStories = computed(() => stories.value)
  const storyProgress = computed(() => progress.value)

  const getStoryById = (id: string) => {
    return stories.value.find(story => story.id === id)
  }

  const getStoryProgressById = (id: string) => {
    return progress.value[id] !== undefined ? progress.value[id] : 0
  }

  // Actions
  const getStories = async (departmentIds: number[]) => {
    try {
      // const data = await this.$axios.$post(
      //   `${API}provider/stories/get/site/byDepartment`,
      //   { departmentIds },
      //   {
      //     headers: {
      //       TOKEN: this.app.$cookies.get('TOKEN')
      //     }
      //   }
      // )
      // const enriched = data.map((item) => {
      //   const dep = rootState.GEO.info.depEntities.find(d => d.id === item.departmentId)
      //   return {
      //     ...item,
      //     departmentName: dep ? dep.name : ''
      //   }
      // })
      // stories.value = enriched
      // return enriched
      console.warn('getStories не реализован в новом API')
      return []
    } catch (error) {
      console.error('Ошибка получения сторис:', error)
      return error
    }
  }

  const updateStoryProgress = ({ storyId, pageIndex }: { storyId: string; pageIndex: number }) => {
    const current = progress.value[storyId] || 0
    if (pageIndex > current) {
      progress.value[storyId] = pageIndex
      // Сохраняем в localStorage
      let storedProgress = {}
      try {
        storedProgress = JSON.parse(localStorage.getItem('storyProgress') || '{}')
      } catch (e) {
        storedProgress = {}
      }
      storedProgress[storyId] = pageIndex
      localStorage.setItem('storyProgress', JSON.stringify(storedProgress))
    }
  }

  const loadStoryProgress = () => {
    let storedProgress = {}
    try {
      storedProgress = JSON.parse(localStorage.getItem('storyProgress') || '{}')
    } catch (e) {
      storedProgress = {}
    }
    progress.value = storedProgress
  }

  return {
    // State
    stories: readonly(stories),
    progress: readonly(progress),
    
    // Getters
    allStories,
    storyProgress,
    getStoryById,
    getStoryProgressById,
    
    // Actions
    getStories,
    updateStoryProgress,
    loadStoryProgress
  }
})