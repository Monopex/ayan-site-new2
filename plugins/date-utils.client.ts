/**
 * Плагин для работы с датами (замена vue-moment)
 */
export default defineNuxtPlugin(() => {
  // Форматирование даты
  const formatDate = (date: Date | string | number, format: string = 'DD.MM.YYYY'): string => {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    const seconds = d.getSeconds().toString().padStart(2, '0')

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString())
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  // Относительное время (например, "2 часа назад")
  const fromNow = (date: Date | string | number): string => {
    const now = new Date()
    const target = new Date(date)
    const diff = now.getTime() - target.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) {
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} назад`
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'} назад`
    } else if (days > 0) {
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`
    } else {
      return 'только что'
    }
  }

  // Проверка, является ли дата сегодняшней
  const isToday = (date: Date | string | number): boolean => {
    const today = new Date()
    const target = new Date(date)
    
    return today.getFullYear() === target.getFullYear() &&
           today.getMonth() === target.getMonth() &&
           today.getDate() === target.getDate()
  }

  // Проверка, является ли дата вчерашней
  const isYesterday = (date: Date | string | number): boolean => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const target = new Date(date)
    
    return yesterday.getFullYear() === target.getFullYear() &&
           yesterday.getMonth() === target.getMonth() &&
           yesterday.getDate() === target.getDate()
  }

  // Добавление дней к дате
  const addDays = (date: Date | string | number, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  // Добавление месяцев к дате
  const addMonths = (date: Date | string | number, months: number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  // Добавление лет к дате
  const addYears = (date: Date | string | number, years: number): Date => {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }

  // Получение начала дня
  const startOfDay = (date: Date | string | number): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  // Получение конца дня
  const endOfDay = (date: Date | string | number): Date => {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  // Получение начала недели
  const startOfWeek = (date: Date | string | number): Date => {
    const result = new Date(date)
    const day = result.getDay()
    const diff = result.getDate() - day + (day === 0 ? -6 : 1) // Понедельник
    result.setDate(diff)
    return startOfDay(result)
  }

  // Получение конца недели
  const endOfWeek = (date: Date | string | number): Date => {
    const result = startOfWeek(date)
    result.setDate(result.getDate() + 6)
    return endOfDay(result)
  }

  // Получение начала месяца
  const startOfMonth = (date: Date | string | number): Date => {
    const result = new Date(date)
    result.setDate(1)
    return startOfDay(result)
  }

  // Получение конца месяца
  const endOfMonth = (date: Date | string | number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + 1, 0)
    return endOfDay(result)
  }

  // Сравнение дат
  const isAfter = (date1: Date | string | number, date2: Date | string | number): boolean => {
    return new Date(date1) > new Date(date2)
  }

  const isBefore = (date1: Date | string | number, date2: Date | string | number): boolean => {
    return new Date(date1) < new Date(date2)
  }

  const isSame = (date1: Date | string | number, date2: Date | string | number): boolean => {
    return new Date(date1).getTime() === new Date(date2).getTime()
  }

  // Получение разности в днях
  const diffInDays = (date1: Date | string | number, date2: Date | string | number): number => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diff = Math.abs(d1.getTime() - d2.getTime())
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  // Валидация даты
  const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime())
  }

  // Инжектим в приложение
  return {
    provide: {
      formatDate,
      fromNow,
      isToday,
      isYesterday,
      addDays,
      addMonths,
      addYears,
      startOfDay,
      endOfDay,
      startOfWeek,
      endOfWeek,
      startOfMonth,
      endOfMonth,
      isAfter,
      isBefore,
      isSame,
      diffInDays,
      isValidDate
    }
  }
})
