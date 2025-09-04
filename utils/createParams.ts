/**
 * Утилиты для создания параметров URL
 */

/**
 * Создание параметров URL для фильтрации по магазинам (из старого проекта)
 */
export function createParams(departments: (string | number)[]): string {
  if (!departments || !Array.isArray(departments) || departments.length === 0) {
    return ''
  }

  const params = departments.reduce((accum, id) => {
    return accum + `id=${id}&`
  }, '')

  return `?${params.slice(0, -1)}`
}
