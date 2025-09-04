/**
 * Утилитарные функции для работы со строками и числами
 */
export const useUtils = () => {
  /**
   * Капитализация первой буквы строки
   */
  const capitalize = (str: string): string => {
    if (!str) return ''
    return str[0] + str.slice(1).toLowerCase()
  }

  /**
   * Транслитерация кириллицы в латиницу
   */
  const translit = (str: string): string => {
    if (!str) return ''
    
    const regexp = /[a-z0-9]/i
    const alph: Record<string, string> = {
      ' ': '-',
      ',': '',
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e',
      'ж': 'g', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l',
      'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
      'т': 't', 'у': 'u', 'ф': 'f', 'ы': 'i', 'э': 'e', 'ё': 'yo',
      'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ъ': '', 'ь': '', 'ю': 'yu', 'я': 'ya'
    }
    
    return str.toLowerCase().split('').map((item) => {
      // латинские буквы и цифры возвращаем без изменения
      if (regexp.test(item)) {
        return item
      }
      return alph[item] || ''
    }).join('')
  }

  /**
   * Склонение числительных на русском языке
   */
  const ruNumString = (number: number, variants: string[]): string => {
    const cases = [2, 0, 1, 1, 1, 2]
    const index = (number % 100 > 4 && number % 100 < 20) 
      ? 2 
      : cases[(number % 10 < 5) ? number % 10 : 5]
    return variants[index] || variants[0] || ''
  }

  /**
   * Нормализация URL
   */
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

  /**
   * Форматирование числа с разделителями тысяч
   */
  const formatNumber = (num: number, locale: string = 'ru-RU'): string => {
    return new Intl.NumberFormat(locale).format(num)
  }

  /**
   * Форматирование валюты
   */
  const formatCurrency = (amount: number, currency: string = 'KZT', locale: string = 'ru-RU'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  /**
   * Обрезка строки до указанной длины
   */
  const truncate = (str: string, length: number, suffix: string = '...'): string => {
    if (!str || str.length <= length) return str
    return str.slice(0, length) + suffix
  }

  /**
   * Генерация случайной строки
   */
  const generateRandomString = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Проверка на валидность email
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Проверка на валидность телефона
   */
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  return {
    capitalize,
    translit,
    ruNumString,
    normalizeUrl,
    formatNumber,
    formatCurrency,
    truncate,
    generateRandomString,
    isValidEmail,
    isValidPhone
  }
}
