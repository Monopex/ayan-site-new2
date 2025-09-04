/**
 * Плагин для работы с URL (замена url-normalizer)
 */
export default defineNuxtPlugin(() => {
  // Нормализация URL (из старого проекта)
  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    
    // Убираем лишние слеши
    let normalized = url.replace(/\/+/g, '/')
    
    // Убираем слеш в конце, кроме корневого
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1)
    }
    
    // Добавляем слеш в начало, если его нет
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized
    }
    
    return normalized
  }

  // Инжектим в приложение
  return {
    provide: {
      normalizeUrl
    }
  }
})
